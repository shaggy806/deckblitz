import { defineCard } from "../define.js";

export default defineCard({
  name: "Phyrexian War Beast",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Phyrexian", "Beast"],
  power: 3,
  toughness: 4,
  text: "When this creature leaves the battlefield, sacrifice a land and this creature deals 1 damage to you.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "sacrifice", who: "you", filter: { type: "land" }, count: 1 },
          { kind: "damage", amount: 1, who: "you" },
        ],
      },
      resolve: null,
      text: "When this creature leaves the battlefield, sacrifice a land and this creature deals 1 damage to you.",
    },
  ],
});
