import { defineCard } from "../define.js";

// EDHREC rank 13567.

export default defineCard({
  name: "Puppet's Verdict",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Flip a coin. If you win the flip, destroy all creatures with power 2 or less. If you lose the flip, destroy all creatures with power 3 or greater.",
  targets: [],
  effect: {
    kind: "flip-coin",
    won: { kind: "destroy-all", filter: { type: "creature", power: { op: "lte", n: 2 } } },
    lost: { kind: "destroy-all", filter: { type: "creature", power: { op: "gte", n: 3 } } },
  },
});
