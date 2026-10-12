import { defineCard } from "../define.js";

export default defineCard({
  name: "Staggershock",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  rebound: true,
  text: "Staggershock deals 2 damage to any target.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
