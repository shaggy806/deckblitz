import { defineCard } from "../define.js";

// EDHREC rank 25477.

export default defineCard({
  name: "Hideous Laughter",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  subtypes: ["Arcane"],
  splice: { onto: "arcane", cost: "{3}{B}{B}" },
  text: "All creatures get -2/-2 until end of turn.\nSplice onto Arcane {3}{B}{B} (As you cast an Arcane spell, you may reveal this card from your hand and pay its splice cost. If you do, add this card's effects to that spell.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
