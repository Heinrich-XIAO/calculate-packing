import { orthogonalTwoPinPackInput } from "../../tests/repros/repro14-orthogonal-two-pin/packInput"
import { PackDebugger } from "../components/PackDebugger"

/**
 * Demonstrates orthogonal placement for two-pin components.
 *
 * The solver prefers to place two-pin components (resistors, capacitors, LEDs)
 * orthogonally (perpendicular) to the pads they connect to.
 *
 * In this example:
 * - R1, R2 connect to VERTICAL pads → placed HORIZONTALLY (0°/180°)
 * - C1, C2 connect to HORIZONTAL pads → placed VERTICALLY (90°/270°)
 */
export default function PackSolver2Repro14OrthogonalPage() {
  return (
    <div className="p-5 grid gap-4">
      <header>
        <h1 className="text-2xl font-bold">
          Orthogonal Placement for Two-Pin Components
        </h1>
        <p className="text-gray-600 mt-2 max-w-prose">
          This demonstrates the orthogonal placement feature where two-pin
          components (resistors, capacitors) are placed perpendicular to the
          pads they connect to.
        </p>
        <ul className="text-gray-600 mt-2 list-disc list-inside">
          <li>
            <strong>R1, R2</strong> connect to <em>vertical</em> pads → placed{" "}
            <strong>horizontally</strong> (0°/180°)
          </li>
          <li>
            <strong>C1, C2</strong> connect to <em>horizontal</em> pads → placed{" "}
            <strong>vertically</strong> (90°/270°)
          </li>
        </ul>
      </header>
      <PackDebugger
        initialPackInput={orthogonalTwoPinPackInput}
        title="Orthogonal Two-Pin Placement"
      />
    </div>
  )
}
