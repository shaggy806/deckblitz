import { defineCard } from "../define.js";

const TEXT = "Your maximum hand size is reduced by two.";

export default defineCard({
  name: "Thought Nibbler",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      maxHandSize: { who: "you", adjust: -2 },
      text: TEXT,
    },
  ],
});
