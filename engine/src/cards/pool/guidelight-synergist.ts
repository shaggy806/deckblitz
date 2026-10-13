import { defineCard } from "../define.js";

// EDHREC rank 12361.

export default defineCard({
  name: "Guidelight Synergist",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Artificer"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: "Flying\nThis creature gets +1/+0 for each artifact you control.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: "This creature gets +1/+0 for each artifact you control.",
    },
  ],
});
