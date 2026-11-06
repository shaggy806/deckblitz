import { defineCard } from "../define.js";

export default defineCard({
  name: "Reconnaissance Partition",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 3,
  text: "This creature enters with two charge counters on it.\n{T}, Remove a counter from this creature: Choose one â€”\nâ€¢ Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\nâ€¢ Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: true, removeCounter: { kind: "any", count: 1 } },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
            effect: {
              kind: "search-library",
              filter: { supertype: "basic", type: "land" },
              destination: "battlefield",
              min: 0,
              max: 1,
              enterTapped: true,
            },
          },
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "{T}, Remove a counter from this creature: Choose one â€”",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "charge", amount: 2 } },
      text: "This creature enters with two charge counters on it.",
    },
  ],
});
