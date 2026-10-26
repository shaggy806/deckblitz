import { defineCard } from "../define.js";

// EDHREC rank 25159.

export default defineCard({
  name: "Vital Surge",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{G}" },
  text: "You gain 3 life.\nSplice onto Arcane {1}{G} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  effect: { kind: "gain-life", amount: 3 },
});
