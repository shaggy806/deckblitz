import { defineCard } from "../define.js";

// No mana cost, so it can't be cast (rule 118.6) — only spliced. Blue by its
// color indicator.
export default defineCard({
  name: "Evermind",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "(Nonexistent mana costs can't be paid.)\nDraw a card.\nSplice onto Arcane {1}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "arcane", cost: "{1}{U}" },
  effect: { kind: "draw", amount: 1 },
});
