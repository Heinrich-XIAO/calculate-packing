import type {
  InputComponent,
  InputPad,
  PackedComponent,
  PackInput,
} from "../types"
import { getStronglyConnectedPadIds } from "./isStrongConnection"

/**
 * Checks if a component is a "two-pin" component (like a resistor, capacitor, LED).
 * A two-pin component has exactly 2 functional pads (excluding the "-inner" pad).
 */
export function isTwoPinComponent(component: InputComponent): boolean {
  const functionalPads = component.pads.filter(
    (pad) => !pad.padId.endsWith("-inner"),
  )
  return functionalPads.length === 2
}

/**
 * Checks if a component is a "two-pin equivalent" - meaning it has exactly 2 externally-connected
 * network IDs. This handles combined components like resistor+LED where internal connections
 * share a networkId but only 2 networks connect to external components.
 *
 * A network is considered "external" if:
 * 1. It exists on a packed component, OR
 * 2. It exists on another unpacked component (shared network across components)
 *
 * @param component The component to check
 * @param packedComponents Components already packed (to check for external connections)
 * @param weightedConnections Optional weighted connections for explicit pad connections
 * @param allComponents All components in the pack input (to detect shared networks)
 */
export function isTwoPinEquivalent(
  component: InputComponent,
  packedComponents: PackedComponent[],
  weightedConnections?: PackInput["weightedConnections"],
  allComponents?: InputComponent[],
): boolean {
  const functionalPads = getFunctionalPads(component)

  // Collect all networkIds that exist on packed components
  const externalNetworkIds = new Set<string>()
  for (const packed of packedComponents) {
    for (const pad of packed.pads) {
      if (pad.networkId && !pad.padId.endsWith("-inner")) {
        externalNetworkIds.add(pad.networkId)
      }
    }
  }

  // Also collect networkIds that exist on OTHER unpacked components
  if (allComponents) {
    for (const otherComponent of allComponents) {
      if (otherComponent.componentId === component.componentId) continue
      for (const pad of getFunctionalPads(otherComponent)) {
        if (pad.networkId) {
          externalNetworkIds.add(pad.networkId)
        }
      }
    }
  }

  // Collect padIds that are strongly connected to packed component pads
  const externallyConnectedPadIds = new Set<string>()
  if (weightedConnections) {
    for (const conn of weightedConnections) {
      // Check if any pad in this connection belongs to a packed component
      const hasPackedPad = conn.padIds.some((padId) =>
        packedComponents.some((pc) => pc.pads.some((p) => p.padId === padId)),
      )
      if (hasPackedPad) {
        // Add all padIds from this connection that belong to our component
        for (const padId of conn.padIds) {
          if (functionalPads.some((p) => p.padId === padId)) {
            externallyConnectedPadIds.add(padId)
          }
        }
      }
    }
  }

  // Count unique external networks this component connects to
  const externalNetworks = new Set<string>()
  for (const pad of functionalPads) {
    // Check if this pad connects externally via weighted connection
    if (externallyConnectedPadIds.has(pad.padId)) {
      if (pad.networkId) {
        externalNetworks.add(pad.networkId)
      } else {
        externalNetworks.add(`pad:${pad.padId}`)
      }
      continue
    }

    // Check if this pad's network exists on another component (packed or unpacked)
    if (pad.networkId && externalNetworkIds.has(pad.networkId)) {
      externalNetworks.add(pad.networkId)
    }
  }

  return externalNetworks.size === 2
}

/**
 * Gets the functional pads of a component (excluding the "-inner" pad).
 */
export function getFunctionalPads(component: InputComponent): InputPad[] {
  return component.pads.filter((pad) => !pad.padId.endsWith("-inner"))
}

/**
 * Gets the length of a two-pin component along its main axis.
 * This is the distance between the two pad centers.
 */
export function getTwoPinComponentLength(component: InputComponent): number {
  const functionalPads = getFunctionalPads(component)
  if (functionalPads.length < 2) return 0

  // For components with 2 pads, use simple distance
  if (functionalPads.length === 2) {
    const [pad1, pad2] = functionalPads as [InputPad, InputPad]
    const dx = pad2.offset.x - pad1.offset.x
    const dy = pad2.offset.y - pad1.offset.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  // For multi-pad components, find the maximum span
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const pad of functionalPads) {
    minX = Math.min(minX, pad.offset.x)
    maxX = Math.max(maxX, pad.offset.x)
    minY = Math.min(minY, pad.offset.y)
    maxY = Math.max(maxY, pad.offset.y)
  }

  const spanX = maxX - minX
  const spanY = maxY - minY

  // Return the larger span (the component's main axis length)
  return Math.max(spanX, spanY)
}

/**
 * Gets the orientation angle (in degrees) of a two-pin component based on pad positions.
 * Returns the angle from pad1 to pad2 in degrees (0 = right, 90 = up, etc.)
 * For multi-pad components, determines if they're laid out horizontally or vertically.
 */
export function getTwoPinComponentOrientation(
  component: InputComponent,
): number {
  const functionalPads = getFunctionalPads(component)
  if (functionalPads.length < 2) return 0

  // For components with 2 pads, use simple angle
  if (functionalPads.length === 2) {
    const [pad1, pad2] = functionalPads as [InputPad, InputPad]
    const dx = pad2.offset.x - pad1.offset.x
    const dy = pad2.offset.y - pad1.offset.y
    return Math.atan2(dy, dx) * (180 / Math.PI)
  }

  // For multi-pad components, determine the main axis based on pad span
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const pad of functionalPads) {
    minX = Math.min(minX, pad.offset.x)
    maxX = Math.max(maxX, pad.offset.x)
    minY = Math.min(minY, pad.offset.y)
    maxY = Math.max(maxY, pad.offset.y)
  }

  const spanX = maxX - minX
  const spanY = maxY - minY

  // If horizontal span is larger, component is laid out horizontally (0 degrees)
  // If vertical span is larger, component is laid out vertically (90 degrees)
  return spanX >= spanY ? 0 : 90
}

export interface OrthogonalPlacementInfo {
  shouldPlaceOrthogonally: boolean
  targetPad?: {
    padId: string
    networkId?: string
    absoluteCenter: { x: number; y: number }
    size: { x: number; y: number }
  }
  preferredRotations?: number[]
}

/**
 * Determines if a two-pin component should be placed orthogonally to its connected pad.
 *
 * Conditions for orthogonal placement:
 * 1. The component is a two-pin component
 * 2. One of its pads connects to a pad on a packed component
 * 3. The component's length fits within: targetPadSize + 2 * minGap
 *
 * @returns Info about whether to place orthogonally and what rotations to prefer
 */
export function getOrthogonalPlacementInfo(
  componentToPack: InputComponent,
  packedComponents: PackedComponent[],
  minGap: number,
  weightedConnections?: PackInput["weightedConnections"],
  allComponents?: InputComponent[],
): OrthogonalPlacementInfo {
  // Check if this is a two-pin component OR a two-pin equivalent (combined components)
  const isTwoPin = isTwoPinComponent(componentToPack)
  const isTwoPinEquiv =
    !isTwoPin &&
    isTwoPinEquivalent(
      componentToPack,
      packedComponents,
      weightedConnections,
      allComponents,
    )

  if (!isTwoPin && !isTwoPinEquiv) {
    return { shouldPlaceOrthogonally: false }
  }

  const functionalPads = getFunctionalPads(componentToPack)
  const componentLength = getTwoPinComponentLength(componentToPack)
  const componentOrientation = getTwoPinComponentOrientation(componentToPack)

  // Find target pads that this component connects to
  for (const pad of functionalPads) {
    const stronglyConnectedPadIds = getStronglyConnectedPadIds(
      pad.padId,
      weightedConnections,
    )

    // Check network-based connections if no explicit weighted connections
    for (const packedComponent of packedComponents) {
      for (const packedPad of packedComponent.pads) {
        // Skip inner pads
        if (packedPad.padId.endsWith("-inner")) continue

        // Check if connected via weighted connections or same network
        const isConnected =
          stronglyConnectedPadIds.has(packedPad.padId) ||
          (stronglyConnectedPadIds.size === 0 &&
            packedPad.networkId === pad.networkId)

        if (!isConnected) continue

        // Found a connected pad - check if component fits orthogonally
        // For true two-pin components, we check if it fits within the pin's dimension + 2 * minGap
        // For two-pin equivalent components (combined components), we skip this check
        // as they may be larger but should still be placed perpendicular
        const maxPadDimension = Math.max(packedPad.size.x, packedPad.size.y)
        const availableSpace = maxPadDimension + 2 * minGap
        const fitsWithinPad = componentLength <= availableSpace

        // Only enforce size restriction for true two-pin components
        if (isTwoPin && !fitsWithinPad) continue

        // For two-pin equivalent, we always prefer orthogonal placement
        {
          // Calculate preferred rotations based on which edge of the chip the pad is on
          // The component should extend perpendicular to the chip edge (away from the chip)

          // Find the bounding box of the packed component (excluding inner pad)
          const functionalPackedPads = packedComponent.pads.filter(
            (p) => !p.padId.endsWith("-inner"),
          )

          let minX = Infinity
          let maxX = -Infinity
          let minY = Infinity
          let maxY = -Infinity
          for (const p of functionalPackedPads) {
            const halfW = p.size.x / 2
            const halfH = p.size.y / 2
            minX = Math.min(minX, p.absoluteCenter.x - halfW)
            maxX = Math.max(maxX, p.absoluteCenter.x + halfW)
            minY = Math.min(minY, p.absoluteCenter.y - halfH)
            maxY = Math.max(maxY, p.absoluteCenter.y + halfH)
          }

          // Determine which edge the target pad is closest to
          const padHalfW = packedPad.size.x / 2
          const padHalfH = packedPad.size.y / 2
          const distToTop = Math.abs(
            maxY - (packedPad.absoluteCenter.y + padHalfH),
          )
          const distToBottom = Math.abs(
            minY - (packedPad.absoluteCenter.y - padHalfH),
          )
          const distToLeft = Math.abs(
            minX - (packedPad.absoluteCenter.x - padHalfW),
          )
          const distToRight = Math.abs(
            maxX - (packedPad.absoluteCenter.x + padHalfW),
          )

          const minHorizontalDist = Math.min(distToTop, distToBottom)
          const minVerticalDist = Math.min(distToLeft, distToRight)

          // Determine if pad is on top/bottom edge or left/right edge
          // A pad is on a horizontal edge (top/bottom) if it's closer to top or bottom
          // than it is to left or right
          let isPadOnHorizontalEdge: boolean
          const epsilon = 0.001

          if (minHorizontalDist < epsilon && minVerticalDist < epsilon) {
            // Corner pad - both distances are essentially 0
            // The pad is on the edge where it has more "room" to the opposite side
            // If distToRight or distToLeft is larger, the pad is more centered horizontally
            // which means it's on a top/bottom (horizontal) edge
            isPadOnHorizontalEdge =
              Math.max(distToLeft, distToRight) >
              Math.max(distToTop, distToBottom)
          } else {
            isPadOnHorizontalEdge = minHorizontalDist < minVerticalDist
          }

          // Adjust for the component's natural orientation
          const isComponentNaturallyHorizontal =
            Math.abs(componentOrientation) < 45 ||
            Math.abs(componentOrientation) > 135

          let preferredRotations: number[]

          if (isComponentNaturallyHorizontal) {
            // Component pads are laid out horizontally (at 0 deg)
            if (isPadOnHorizontalEdge) {
              // Pad is on top/bottom edge, rotate component to be vertical
              preferredRotations = [90, 270]
            } else {
              // Pad is on left/right edge, keep component horizontal
              preferredRotations = [0, 180]
            }
          } else {
            // Component pads are laid out vertically (at 90 deg)
            if (isPadOnHorizontalEdge) {
              // Pad is on top/bottom edge, keep component vertical
              preferredRotations = [0, 180]
            } else {
              // Pad is on left/right edge, rotate component to be horizontal
              preferredRotations = [90, 270]
            }
          }

          return {
            shouldPlaceOrthogonally: true,
            targetPad: {
              padId: packedPad.padId,
              networkId: packedPad.networkId,
              absoluteCenter: packedPad.absoluteCenter,
              size: packedPad.size,
            },
            preferredRotations,
          }
        }
      }
    }
  }

  return { shouldPlaceOrthogonally: false }
}
