import { defineCard } from "../define.js";

// EDHREC rank 25241.

export default defineCard({
  name: "Ultimate Alliance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Ultimate Alliance deals damage equal to the number of creatures you control to target creature.",
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
});
