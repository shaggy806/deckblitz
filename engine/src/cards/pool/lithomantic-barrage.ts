import { defineCard } from "../define.js";

// EDHREC rank 17791.
//
// The target's colours are read as the spell resolves. "Can't be countered"
// holds against ward too (the ruling).

export default defineCard({
  name: "Lithomantic Barrage",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nLithomantic Barrage deals 1 damage to target creature or planeswalker. It deals 5 damage instead if that target is white and/or blue.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }] } },
    then: { kind: "damage", amount: 5, target: 0 },
    else: { kind: "damage", amount: 1, target: 0 },
  },
});
