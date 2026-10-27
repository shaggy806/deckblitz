import { defineCard } from "../define.js";

// EDHREC rank 22447.

export default defineCard({
  name: "Dampen Thought",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{1}{U}" },
  text: "Target player mills four cards.\nSplice onto Arcane {1}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: 4 },
});
