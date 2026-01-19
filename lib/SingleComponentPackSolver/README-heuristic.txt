Heuristic: outline proximity

This file documents the outline proximity heuristic implemented in
SingleComponentPackSolver.calculateDistance().

Approach:
- For each candidate placement we already compute `totalDistance` based on
  network distances (primary objective).
- We now add a secondary cost (outlineProximityCost) that sums the minimum
  distances from each pad to the nearest outline segment.
- Outline segments are constructed from:
  - outlines (constructOutlinesFromPackedComponents)
  - boundaryOutline (if provided)
  - obstacle rectangle edges (expanded by minGap)
- The total cost returned:
    totalCost = totalDistance + outlineProximityCost * outlineProximityWeight

Reasoning:
- Using distances to the outline/used areas encourages pads to be placed
  near existing components and obstacles (i.e., fitting into the gaps along
  the outline).
- This is more semantically meaningful than proximity to arbitrary pad
  centers because it encourages placement along edges and corners where
  components naturally attach.

Tunable:
- outlineProximityWeight (currently 0.12) controls the influence of this
  heuristic relative to the primary network distance. Increase to favor
  outline-adjacent placements more strongly; decrease to make it a weaker
  tie-breaker.
