import { defineCard } from "../define.js";

// EDHREC rank 31150. The Haunt of Hightower's shape.

const TEXT = "Whenever this creature attacks, defending player discards a card.";

export default defineCard({
  name: "Shrieking Specter",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      resolve: null,
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      text: TEXT,
    },
  ],
});
