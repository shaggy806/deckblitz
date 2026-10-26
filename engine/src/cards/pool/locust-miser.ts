import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). `maxHandSize` effects apply in timestamp order
// (rule 613.11 — the ruling's Cursed Rack example).
const TEXT = "Each opponent's maximum hand size is reduced by two.";

export default defineCard({
  name: "Locust Miser",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Shaman"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      maxHandSize: { who: "opponents", adjust: -2 },
      text: TEXT,
    },
  ],
});
