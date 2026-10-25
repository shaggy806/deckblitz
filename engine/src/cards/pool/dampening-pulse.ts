import { defineCard } from "../define.js";

// EDHREC rank 27073.

export default defineCard({
  name: "Dampening Pulse",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Creatures your opponents control get -1/-0.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } },
      grantPt: [-1, 0],
      text: "Creatures your opponents control get -1/-0.",
    },
  ],
});
