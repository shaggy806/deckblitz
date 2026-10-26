import { defineCard } from "../define.js";

// EDHREC rank 26303.

const TEXT = "Creatures your opponents control get -1/-0.";

export default defineCard({
  name: "Cumber Stone",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  static: [{ affects: { scope: "filter", filter: { type: "creature", controlledBy: "opponent" } }, grantPt: [-1, 0], text: TEXT }],
});
