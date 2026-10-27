import { defineCard } from "../define.js";

const TEXT = "Your maximum hand size is reduced by four.";

export default defineCard({
  name: "Thought Devourer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      maxHandSize: { who: "you", adjust: -4 },
      text: TEXT,
    },
  ],
});
