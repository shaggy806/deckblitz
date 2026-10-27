import { defineCard } from "../define.js";

// EDHREC rank 31802. Fifth Dawn.

export default defineCard({
  name: "Nim Grotesque",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 6,
  text: "This creature gets +1/+0 for each artifact you control.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: "This creature gets +1/+0 for each artifact you control.",
    },
  ],
});
