import { defineCard } from "../define.js";

// Planar Chaos.
export default defineCard({
  name: "Cradle to Grave",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonblack creature that entered this turn.",
  targets: [{ kind: "permanent", filter: { type: "creature", notColors: ["B"], enteredThisTurn: true } }],
  effect: { kind: "destroy", target: 0 },
});
