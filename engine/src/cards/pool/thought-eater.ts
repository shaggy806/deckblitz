import { defineCard } from "../define.js";

const TEXT = "Your maximum hand size is reduced by three.";

export default defineCard({
  name: "Thought Eater",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      maxHandSize: { who: "you", adjust: -3 },
      text: TEXT,
    },
  ],
});
