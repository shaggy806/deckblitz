import { defineCard } from "../define.js";

// Legends. EDHREC rank 24075.
//
// "Activate only during your upkeep": your turn, and its upkeep step. The
// sacrificed creature's toughness is read as it last existed (rule 608.2h).
export default defineCard({
  name: "Life Chisel",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "Sacrifice a creature: You gain life equal to the sacrificed creature's toughness. Activate only during your upkeep.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "creature-you-control" },
      condition: { kind: "all", of: [{ kind: "your-turn" }, { kind: "turn-structure", steps: ["upkeep"] }] },
      targets: [],
      effect: { kind: "gain-life", amount: { toughnessOf: "sacrificed" } },
      resolve: null,
      text: "Sacrifice a creature: You gain life equal to the sacrificed creature's toughness. Activate only during your upkeep.",
    },
  ],
});
