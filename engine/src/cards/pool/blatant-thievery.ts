import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// Rulings:
//   You gain control of only one permanent from each player.
//   If a permanent changes controller after being targeted but before this spell resolves, you
//     won't gain control of that permanent.
//
// "For each opponent … target permanent that player controls": one required slot per opponent,
// bound to that player by seat — a seat past the table or whose player has left needs none
// (`emptySeatOptional`), and a live opponent with no permanent leaves it uncastable (rule
// 601.2c). A target that has changed controller is no longer "that player's" as it resolves.
const ofOpponent = (seat: number): TargetSpec => ({ kind: "permanent", whose: { seat }, filter: {} });

export default defineCard({
  name: "Blatant Thievery",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each opponent, gain control of target permanent that player controls.",
  targets: [ofOpponent(1), ofOpponent(2), ofOpponent(3)],
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
