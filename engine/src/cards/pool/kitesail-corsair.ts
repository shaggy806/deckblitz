import { defineCard } from "../define.js";

const TEXT = "This creature has flying as long as it's attacking.";

export default defineCard({
  name: "Kitesail Corsair",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
