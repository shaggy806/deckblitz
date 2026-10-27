import { defineCard } from "../define.js";

// EDHREC rank 21255.

export default defineCard({
  name: "Glacial Ray",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{R}" },
  text: "Glacial Ray deals 2 damage to any target.\nSplice onto Arcane {1}{R} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
