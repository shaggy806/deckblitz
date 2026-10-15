import { defineCard } from "../define.js";

// EDHREC rank 20318.
// Makes Zombie Druid → "Zombie Druid Token" (a 2/2 black Zombie Druid).

const SEARCH_TEXT =
  "When this artifact enters, search your library for a basic Swamp, Forest, or Island card, reveal it, put it into your hand, then shuffle.";
const SAC_TEXT =
  "{2}{B}{G}{U}, {T}, Sacrifice this artifact: Create two 2/2 black Zombie Druid creature tokens. Activate only as a sorcery.";

export default defineCard({
  name: "Sultai Monument",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${SEARCH_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", subtypes: ["Swamp", "Forest", "Island"] },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}{G}{U}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Zombie Druid Token", count: 2 },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
