import { defineCard } from "../define.js";

// EDHREC rank 14918. Fate Reforged.

export default defineCard({
  name: "Map the Wastes",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      { kind: "bolster", amount: 1 },
    ],
  },
});
