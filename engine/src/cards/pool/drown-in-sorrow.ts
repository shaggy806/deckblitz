import { defineCard } from "../define.js";

export default defineCard({
  name: "Drown in Sorrow",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -2/-2 until end of turn. Scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -2,
        toughness: -2,
        duration: "end-of-turn",
      },
      { kind: "scry", amount: 1 },
    ],
  },
});
