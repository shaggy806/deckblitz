import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 29006.
const TEXT = "This creature gets +1/+1 as long as you control an artifact.";

export default defineCard({
  name: "Inventor's Apprentice",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      text: TEXT,
    },
  ],
});
