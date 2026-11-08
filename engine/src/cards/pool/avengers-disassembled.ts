import { defineCard } from "../define.js";

// EDHREC rank 15047.

export default defineCard({
  name: "Avengers Disassembled",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Choose one or both —\n• Avengers Disassembled deals 3 damage to each creature.\n• Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: "Avengers Disassembled deals 3 damage to each creature.",
        effect: { kind: "damage-all", amount: 3, filter: { type: "creature" } },
      },
      {
        text: "Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle.",
        targets: ["land"],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "destroy", target: 0 },
            {
              kind: "each-player-may",
              who: { controllerOf: 0 },
              prompt: "Search your library for a basic land card?",
              effect: {
                kind: "search-library",
                filter: { supertype: "basic", type: "land" },
                destination: "battlefield",
                min: 0,
                max: 1,
                enterTapped: true,
              },
            },
          ],
        },
      },
    ],
  },
});
