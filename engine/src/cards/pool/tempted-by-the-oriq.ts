import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// Rulings:
//   [2021-04-16] Unless it has haste, you will not able to attack with a creature or activate its
//     abilities that have {T} in the cost on the turn you gain control of it.
//   [2021-04-16] Tempted by the Oriq’s control-changing effect lasts indefinitely.
//
// "For each opponent … that player controls": one optional slot per opponent,
// bound to that player by seat (Lich's Relic's shape).
const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: {
    kind: "permanent",
    whose: { seat },
    filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 3 } },
  },
});

export default defineCard({
  name: "Tempted by the Oriq",
  manaCost: "{1}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "For each opponent, gain control of up to one target creature or planeswalker that player controls with mana value 3 or less.",
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
