import { defineCard } from "../define.js";

// EDHREC rank 14434. Zendikar Rising. Tear Asunder's shape: kicked, the spell
// has a wider target.

export default defineCard({
  name: "Bloodchief's Thirst",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Kicker {2}{B} (You may pay an additional {2}{B} as you cast this spell.)\nDestroy target creature or planeswalker with mana value 2 or less. If this spell was kicked, instead destroy target creature or planeswalker.",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["creature", "planeswalker"], manaValue: { op: "lte", n: 2 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
  kicker: {
    cost: "{2}{B}",
    targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
    effect: { kind: "destroy", target: 0 },
  },
});
