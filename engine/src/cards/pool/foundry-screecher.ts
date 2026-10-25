import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 25311.
export default defineCard({
  name: "Foundry Screecher",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Bat"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: "Flying\nThis creature gets +1/+0 as long as you control an artifact.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 0],
      text: "This creature gets +1/+0 as long as you control an artifact.",
    },
  ],
});
