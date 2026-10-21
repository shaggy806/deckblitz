import { defineCard } from "../define.js";

// EDHREC rank 19590. The count is read as it resolves (the ruling).

export default defineCard({
  name: "Outflank",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Outflank deals damage to target attacking or blocking creature equal to the number of creatures you control.",
  targets: ["attacking-or-blocking-creature"],
  effect: { kind: "damage", target: 0, amount: { countOf: { type: "creature", controlledBy: "you" } } },
});
