import { defineCard } from "../define.js";

// EDHREC rank 8744.

export default defineCard({
  name: "Nissa's Renewal",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to three basic land cards, put them onto the battlefield tapped, then shuffle. You gain 7 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 3,
      },
      { kind: "gain-life", amount: 7 },
    ],
  },
});
