import { defineCard } from "../define.js";

export default defineCard({
  name: "Inventor's Apprentice",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: "This creature gets +1/+1 as long as you control an artifact.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: "This creature gets +1/+1 as long as you control an artifact.",
    },
  ],
});
