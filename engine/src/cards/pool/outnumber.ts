import { defineCard } from "../define.js";

// EDHREC rank 9025.
//
// The creatures are counted as it resolves (the ruling).
const TEXT = "Outnumber deals damage to target creature equal to the number of creatures you control.";

export default defineCard({
  name: "Outnumber",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
});
