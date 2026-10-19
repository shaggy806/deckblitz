import { defineCard } from "../define.js";

// Ruling (2022-09-09): with its target illegal as it resolves, it does
// nothing, kicked or not (the whole spell fizzles).
export default defineCard({
  name: "Hurloon Battle Hymn",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text:
    "Kicker {W} (You may pay an additional {W} as you cast this spell.)\n" +
    "Hurloon Battle Hymn deals 4 damage to target creature or planeswalker. If this spell was kicked, you gain 4 life.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: { kind: "damage", amount: 4, target: 0 },
  kicker: {
    cost: "{W}",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 4, target: 0 },
        { kind: "gain-life", amount: 4 },
      ],
    },
  },
});
