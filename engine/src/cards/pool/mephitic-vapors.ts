import { defineCard } from "../define.js";

export default defineCard({
  name: "Mephitic Vapors",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "All creatures get -1/-1 until end of turn.\nSurveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      { kind: "surveil", amount: 2 },
    ],
  },
});
