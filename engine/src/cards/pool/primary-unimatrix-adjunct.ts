import { defineCard } from "../define.js";

// EDHREC rank 22743.

export default defineCard({
  name: "Primary Unimatrix Adjunct",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 3,
  text: "Artifact creatures you control have double strike.",
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantKeywords: ["double-strike"],
      text: "Artifact creatures you control have double strike.",
    },
  ],
});
