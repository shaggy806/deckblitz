import { defineCard } from "../define.js";

export default defineCard({
  name: "Narset's Rebuke",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Narset's Rebuke deals 5 damage to target creature. Add {U}{R}{W}. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 5, target: 0 },
      { kind: "add-mana", mana: { all: ["U", "R", "W"] }, amount: 1 },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
