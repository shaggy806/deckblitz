import { defineCard } from "../define.js";

// Rulings:
//   [2020-01-24] Creatures and planeswalkers don’t necessarily have to be dealt lethal damage by
//     Underworld Fires to be exiled. After being dealt damage, if they would die for any reason
//     that turn, they’ll be exiled instead.

export default defineCard({
  name: "Underworld Fires",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Underworld Fires deals 1 damage to each creature and each planeswalker. If a permanent dealt damage this way would die this turn, exile it instead.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", amount: 1, filter: { typesAnyOf: ["creature", "planeswalker"] } },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "permanent" },
    ],
  },
});
