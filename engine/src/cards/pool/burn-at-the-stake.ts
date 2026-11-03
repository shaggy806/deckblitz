import { defineCard } from "../define.js";

export default defineCard({
  name: "Burn at the Stake",
  manaCost: "{2}{R}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, tap any number of untapped creatures you control.\nBurn at the Stake deals damage to any target equal to three times the number of creatures tapped this way.",
  additionalCost: {
    also: { text: "Tap any number of untapped creatures you control", tapAnyNumber: { filter: { type: "creature" } } },
  },
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { product: [3, "x"] } },
});
