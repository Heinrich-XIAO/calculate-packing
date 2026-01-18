import { orthogonalTwoPinPackInput } from "../../tests/repros/repro14-orthogonal-two-pin/packInput"
import { PackDebugger } from "../components/PackDebugger"

export default function PackSolver2Repro14Page() {
  return (
    <PackDebugger
      initialPackInput={orthogonalTwoPinPackInput}
      title="PackSolver2 Repro 14"
    />
  )
}
