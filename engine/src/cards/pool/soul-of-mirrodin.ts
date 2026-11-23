import { defineCard } from "../define.js";

// Playtest card, after the M15 Souls. The graveyard ability's cost exiles it
// (`zone: "graveyard"`).

const SEARCH_TEXT =
  "Search your library for an artifact card with mana value 5 or less, put it onto the battlefield tapped, then shuffle.";

const SEARCH = {
  kind: "search-library",
  filter: { type: "artifact", manaValue: { op: "lte", n: 5 } },
  destination: "battlefield",
  min: 0,
  max: 1,
  enterTapped: true,
} as const;

export default defineCard({
  name: "Soul of Mirrodin",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spirit"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n{5}: ${SEARCH_TEXT}\n{5}, Exile Soul of Mirrodin from your graveyard: ${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}", tap: false },
      targets: [],
      effect: SEARCH,
      resolve: null,
      text: `{5}: ${SEARCH_TEXT}`,
    },
    {
      cost: { mana: "{5}", tap: false },
      zone: "graveyard",
      targets: [],
      effect: SEARCH,
      resolve: null,
      text: `{5}, Exile Soul of Mirrodin from your graveyard: ${SEARCH_TEXT}`,
    },
  ],
});
