import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// "For each opponent … that player controls": one optional slot per
// opponent, bound to that player by seat (Tempted by the Oriq's shape).
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "artifact" } },
});

export default defineCard({
  name: "Bilbo's Burglaring",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each opponent, gain control of up to one target artifact that player controls.",
  targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: false },
      { kind: "gain-control", target: 1, untilEndOfTurn: false },
      { kind: "gain-control", target: 2, untilEndOfTurn: false },
    ],
  },
});
