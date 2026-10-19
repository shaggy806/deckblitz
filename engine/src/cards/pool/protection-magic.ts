import { defineCard } from "../define.js";

// EDHREC rank 4136.

export default defineCard({
  name: "Protection Magic",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Put a shield counter on each of up to three target creatures. (If a creature with a shield counter would be dealt damage or destroyed, remove a shield counter from it instead.)",
  targets: [{ kind: "any-number", of: "creature", max: 3 }],
  effect: { kind: "for-each-target", from: 0, effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 } },
});
