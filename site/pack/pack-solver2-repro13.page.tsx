import { packSolver2ReproInput } from "../../tests/repros/repro13/packInput"
import { PackDebugger } from "../components/PackDebugger"

export default function PackSolver2Repro13Page() {
  return (
    <div className="p-5 grid gap-4">
      <header>
        <h1 className="text-2xl font-bold">PackSolver2 Repro 13</h1>
        <p className="text-gray-600 mt-2 max-w-prose">
          Interactive view for a multi-component input with 4 source groups and
          1 main component, featuring weighted connections between pads. Use the
          debugger controls below to inspect packing behavior and visualize the
          resulting placement.
        </p>
      </header>
      <PackDebugger
        initialPackInput={packSolver2ReproInput}
        title="PackSolver2 Repro 13"
      />
    </div>
  )
}
