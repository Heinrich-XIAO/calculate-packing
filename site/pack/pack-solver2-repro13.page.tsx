import { packSolver2ReproInput } from "../../tests/repros/repro13/packInput"
import { PackDebugger } from "../components/PackDebugger"

export default function PackSolver2Repro13Page() {
  return (
    <div className="p-5 grid gap-4">
      <header>
        <h1 className="text-2xl font-bold">PackSolver2 Repro 13</h1>
      </header>
      <PackDebugger
        initialPackInput={packSolver2ReproInput}
        title="PackSolver2 Repro 13"
      />
    </div>
  )
}
