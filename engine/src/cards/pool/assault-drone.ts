import { defineCard } from "../define.js";

// EDHREC rank 29466.

export default defineCard({
  name: "Assault Drone",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 4,
  text: "Artifact creatures you control get +1/+0.",
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantPt: [1, 0],
      text: "Artifact creatures you control get +1/+0.",
    },
  ],
});
