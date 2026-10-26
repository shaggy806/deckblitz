import { defineCard } from "../define.js";

// EDHREC rank 31061. Molten Man's shape, for a creature.

export default defineCard({
  name: "Servant of Volrath",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Minion"],
  power: 3,
  toughness: 3,
  text: "When this creature leaves the battlefield, sacrifice a creature.",
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: "When this creature leaves the battlefield, sacrifice a creature.",
    },
  ],
});
