import { defineCard } from "../define.js";

// Spree. Both modes chosen, the searched card is in the graveyard before
// the return, so it can be one of the two (the modes happen in printed
// order). The return isn't targeted: up to two creature cards chosen as it
// resolves, their mana values adding up to 4 or less.
const SEARCH_MODE = "+ {1} — Search your library for a card, put it into your graveyard, then shuffle.";
const RETURN_MODE =
  "+ {2} — Return up to two creature cards with total mana value 4 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Lively Dirge",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: `Spree (Choose one or more additional costs.)\n${SEARCH_MODE}\n${RETURN_MODE}`,
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: SEARCH_MODE,
        spreeCost: "{1}",
        targets: [],
        effect: { kind: "search-library", filter: {}, destination: "graveyard", min: 1, max: 1 },
      },
      {
        text: RETURN_MODE,
        spreeCost: "{2}",
        targets: [],
        effect: {
          kind: "return-from-graveyard",
          filter: { type: "creature" },
          destination: "battlefield",
          count: 2,
          upTo: true,
          totalManaValueAtMost: 4,
        },
      },
    ],
  },
});
