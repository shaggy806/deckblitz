import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 30685.

const TEXT = "This creature has flying as long as it's enchanted.";

export default defineCard({
  name: "Fledgling Osprey",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      grantKeywords: ["flying"],
      text: TEXT,
    },
  ],
});
