import { expect, test } from "bun:test"
import { getSvgFromGraphicsObject } from "graphics-debug"
import { PackSolver2 } from "../../lib/PackSolver2/PackSolver2"
import { packSolver2ReproInput } from "./repro13/packInput"

// Regression test for a PackSolver2 input with 5 components (4 source groups + 1 main component)
// with weighted connections between pads.
test("repro13 - PackSolver2 handles multi-component input with weighted connections", () => {
  const solver = new PackSolver2(packSolver2ReproInput)

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

  expect(solver.failed).toBe(false)

  expect(
    getSvgFromGraphicsObject(solver.visualize(), {
      backgroundColor: "white",
    }),
  ).toMatchSvgSnapshot(import.meta.path)
})
