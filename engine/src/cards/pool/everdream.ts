import { defineCard } from "../define.js";

export default defineCard({
  name: "Everdream",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw a card.\nSplice onto instant or sorcery {2}{U} (As you cast an instant or sorcery spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  splice: { onto: "instant-or-sorcery", cost: "{2}{U}" },
  effect: { kind: "draw", amount: 1 },
});
