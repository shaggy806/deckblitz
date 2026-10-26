import { defineCard } from "../define.js";

// The left half of Hit // Run. The damage is the mana value of the permanent
// sacrificed this way (a token's is 0, rule 202.3); nothing sacrificed, none.
const FACES = ["Hit // Run", "Hit", "Run"];

export default defineCard({
  name: "Hit",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["instant"],
  text: "Target player sacrifices an artifact or creature of their choice. Hit deals damage to that player equal to that permanent's mana value.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { typesAnyOf: ["artifact", "creature"] }, count: 1 },
      { kind: "damage", amount: { thisWay: "sacrificed", sumOf: "mana-value" }, target: 0 },
    ],
  },
  faces: FACES,
  split: true,
});
