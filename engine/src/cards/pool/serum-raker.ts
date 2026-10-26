import { defineCard } from "../define.js";

const TEXT = "When this creature dies, each player discards a card.";

export default defineCard({
  name: "Serum Raker",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Drake"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "each-player", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
