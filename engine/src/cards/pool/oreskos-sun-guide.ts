import { defineCard } from "../define.js";

// EDHREC rank 18905.

const TEXT = "Inspired — Whenever this creature becomes untapped, you gain 2 life.";

export default defineCard({
  name: "Oreskos Sun Guide",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Monk"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-untapped", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
