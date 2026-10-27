import { defineCard } from "../define.js";

// EDHREC rank 20707.

export default defineCard({
  name: "Consuming Vortex",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{3}{U}" },
  text: "Return target creature to its owner's hand.\nSplice onto Arcane {3}{U} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  targets: ["creature"],
  effect: { kind: "return-to-hand", target: 0 },
});
