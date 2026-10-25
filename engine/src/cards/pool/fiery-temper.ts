import { defineCard } from "../define.js";

export default defineCard({
  name: "Fiery Temper",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  madness: { cost: "{R}" },
  text: "Fiery Temper deals 3 damage to any target.\nMadness {R} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
