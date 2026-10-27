import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 24481. Two targets; one gone illegal leaves the other's part
// to happen (rule 608.2b).

export default defineCard({
  name: "Suffocating Blast",
  manaCost: "{1}{U}{U}{R}",
  colors: ["U", "R"],
  types: ["instant"],
  text: "Counter target spell and Suffocating Blast deals 3 damage to target creature.",
  targets: ["spell", "creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "damage", amount: 3, target: 1 },
    ],
  },
});
