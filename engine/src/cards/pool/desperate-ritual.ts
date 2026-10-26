import { defineCard } from "../define.js";

export default defineCard({
  name: "Desperate Ritual",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Add {R}{R}{R}.\nSplice onto Arcane {1}{R} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{1}{R}" },
  effect: { kind: "add-mana", mana: "R", amount: 3 },
});
