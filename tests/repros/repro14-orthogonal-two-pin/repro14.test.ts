import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { PackSolver2 } from "../../../lib/PackSolver2/PackSolver2"
import { orthogonalTwoPinPackInput } from "./packInput"

test("repro14 - perpendicular placement for two-pin components", async () => {
  /**
   * This test verifies the perpendicular placement feature for two-pin components.
   *
   * Two-pin components are placed perpendicular to the edge of the chip they connect to,
   * extending away from the chip.
   *
   * Setup:
   * - Main IC (U1) with:
   *   - 4 pads on top edge (U1.1-U1.4)
   *   - 2 pads on bottom edge (U1.5-U1.6)
   *
   * - R1, R2: Two-pin components connecting to top edge pads
   *   Expected: Vertical placement (90° or 270°) to extend upward from the chip
   *
   * - C1, C2: Two-pin components connecting to bottom edge pads
   *   Expected: Vertical placement (90° or 270°) to extend downward from the chip
   */

  const solver = new PackSolver2(orthogonalTwoPinPackInput)
  solver.solve()

  console.log("Packed components:")
  console.table(
    solver.packedComponents.map((c) => ({
      id: c.componentId,
      x: c.center.x.toFixed(2),
      y: c.center.y.toFixed(2),
      rotation: c.ccwRotationOffset,
    })),
  )

  // Verify R1 and R2 are placed vertically (90° or 270°) - perpendicular to top edge
  const R1 = solver.packedComponents.find((c) => c.componentId === "R1")!
  const R2 = solver.packedComponents.find((c) => c.componentId === "R2")!
  expect([90, 270]).toContain(R1.ccwRotationOffset)
  expect([90, 270]).toContain(R2.ccwRotationOffset)

  // Verify C1 and C2 are placed vertically (90° or 270°) - perpendicular to bottom edge
  const C1 = solver.packedComponents.find((c) => c.componentId === "C1")!
  const C2 = solver.packedComponents.find((c) => c.componentId === "C2")!
  expect([90, 270]).toContain(C1.ccwRotationOffset)
  expect([90, 270]).toContain(C2.ccwRotationOffset)

  expect(
    getSvgFromGraphicsObject(solver.visualize(), {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
