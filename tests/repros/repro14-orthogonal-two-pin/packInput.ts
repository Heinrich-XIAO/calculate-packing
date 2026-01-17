import type { PackInput } from "../../../lib/types"

/**
 * Test case for orthogonal placement of two-pin components.
 *
 * This test demonstrates the orthogonal placement feature where two-pin components
 * (resistors, capacitors, LEDs) prefer to be placed orthogonally (perpendicular)
 * to the pads they connect to, when they fit within the available space.
 *
 * Setup:
 * - A main IC (U1) with vertical pads on top (taller than wide)
 * - Several two-pin components (R1, R2, C1) that connect to the IC pads
 *
 * Expected behavior:
 * - Since the IC pads are vertical (taller than wide), two-pin components
 *   should prefer horizontal placement (0° or 180° rotation)
 * - This makes the component orthogonal to the vertical pad orientation
 */
export const orthogonalTwoPinPackInput: PackInput = {
  components: [
    // Main IC with vertical pads on top
    {
      componentId: "U1",
      pads: [
        // Top row of vertical pads (y=2.5)
        {
          padId: "U1.1",
          networkId: "net1",
          type: "rect",
          size: { x: 0.6, y: 2.0 }, // vertical pad
          offset: { x: -3, y: 2.5 },
        },
        {
          padId: "U1.2",
          networkId: "net2",
          type: "rect",
          size: { x: 0.6, y: 2.0 }, // vertical pad
          offset: { x: -1, y: 2.5 },
        },
        {
          padId: "U1.3",
          networkId: "net3",
          type: "rect",
          size: { x: 0.6, y: 2.0 }, // vertical pad
          offset: { x: 1, y: 2.5 },
        },
        {
          padId: "U1.4",
          networkId: "net4",
          type: "rect",
          size: { x: 0.6, y: 2.0 }, // vertical pad
          offset: { x: 3, y: 2.5 },
        },
        // Bottom row of horizontal pads (y=-2.5)
        {
          padId: "U1.5",
          networkId: "net5",
          type: "rect",
          size: { x: 2.0, y: 0.6 }, // horizontal pad
          offset: { x: -2, y: -2.5 },
        },
        {
          padId: "U1.6",
          networkId: "net6",
          type: "rect",
          size: { x: 2.0, y: 0.6 }, // horizontal pad
          offset: { x: 2, y: -2.5 },
        },
        // Inner body pad
        {
          padId: "U1-inner",
          networkId: "U1-inner",
          type: "rect",
          size: { x: 8, y: 6 },
          offset: { x: 0, y: 0 },
        },
      ],
    },
    // Two-pin component connecting to vertical pad U1.1
    // Should prefer horizontal placement (0° or 180°)
    {
      componentId: "R1",
      pads: [
        {
          padId: "R1.1",
          networkId: "net1", // connects to U1.1
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: -0.7, y: 0 },
        },
        {
          padId: "R1.2",
          networkId: "gnd",
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: 0.7, y: 0 },
        },
      ],
    },
    // Two-pin component connecting to vertical pad U1.2
    // Should prefer horizontal placement (0° or 180°)
    {
      componentId: "R2",
      pads: [
        {
          padId: "R2.1",
          networkId: "net2", // connects to U1.2
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: -0.7, y: 0 },
        },
        {
          padId: "R2.2",
          networkId: "vcc",
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: 0.7, y: 0 },
        },
      ],
    },
    // Two-pin component connecting to horizontal pad U1.5
    // Should prefer vertical placement (90° or 270°)
    {
      componentId: "C1",
      pads: [
        {
          padId: "C1.1",
          networkId: "net5", // connects to U1.5 (horizontal)
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: -0.7, y: 0 },
        },
        {
          padId: "C1.2",
          networkId: "gnd",
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: 0.7, y: 0 },
        },
      ],
    },
    // Two-pin component connecting to horizontal pad U1.6
    // Should prefer vertical placement (90° or 270°)
    {
      componentId: "C2",
      pads: [
        {
          padId: "C2.1",
          networkId: "net6", // connects to U1.6 (horizontal)
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: -0.7, y: 0 },
        },
        {
          padId: "C2.2",
          networkId: "vcc",
          type: "rect",
          size: { x: 0.5, y: 0.5 },
          offset: { x: 0.7, y: 0 },
        },
      ],
    },
  ],
  minGap: 0.5,
  packOrderStrategy: "largest_to_smallest",
  packPlacementStrategy: "shortest_connection_along_outline",
  obstacles: [],
  weightedConnections: [
    // Connect R1 to U1.1 (vertical pad)
    { padIds: ["R1.1", "U1.1"], weight: 1, ignoreWeakConnections: true },
    // Connect R2 to U1.2 (vertical pad)
    { padIds: ["R2.1", "U1.2"], weight: 1, ignoreWeakConnections: true },
    // Connect C1 to U1.5 (horizontal pad)
    { padIds: ["C1.1", "U1.5"], weight: 1, ignoreWeakConnections: true },
    // Connect C2 to U1.6 (horizontal pad)
    { padIds: ["C2.1", "U1.6"], weight: 1, ignoreWeakConnections: true },
  ],
  bounds: {
    minX: -10,
    maxX: 10,
    minY: -10,
    maxY: 10,
  },
}
