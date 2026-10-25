import { defineCard } from "../define.js";

// EDHREC rank 15744.

export default defineCard({
  name: "Biting Rain",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  madness: { cost: "{2}{B}" },
  text: "All creatures get -2/-2 until end of turn.\nMadness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)",
  effect: {
    kind: "modify-pt-all",
    filter: { type: "creature" },
    power: -2,
    toughness: -2,
    duration: "end-of-turn",
  },
});
