import { defineCard } from "../define.js";

// EDHREC rank 18840.
// Makes Bird → "Bird Token" (a 1/1 white Bird with flying).

const SEARCH_TEXT =
  "When this artifact enters, search your library for a basic Island, Mountain, or Plains card, reveal it, put it into your hand, then shuffle.";
const SAC_TEXT =
  "{1}{U}{R}{W}, {T}, Sacrifice this artifact: Create two 1/1 white Bird creature tokens with flying. Activate only as a sorcery.";

export default defineCard({
  name: "Jeskai Monument",
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
        filter: { supertype: "basic", subtypes: ["Island", "Mountain", "Plains"] },
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
      cost: { mana: "{1}{U}{R}{W}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token", count: 2 },
      resolve: null,
      text: SAC_TEXT,
      sorcerySpeed: true,
    },
  ],
});
