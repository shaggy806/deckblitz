import { defineCard } from "../define.js";

// EDHREC rank 18309.
//
// Rulings:
//   [2025-10-02] The triggered ability can trigger only once each turn. It doesn't matter whether
//     Foggy Swamp Spirit Keeper was on the battlefield when the first card was drawn.
//   [2025-10-02] If an effect instructs you to draw multiple cards, the ability triggers after you
//     draw whichever is the second one for the turn.
//
// The Spirit is Realm of Koh's and Hei Bai's token.

const DRAW_TEXT =
  'Whenever you draw your second card each turn, create a 1/1 colorless Spirit creature token with "This token can\'t block or be blocked by non-Spirit creatures."';

export default defineCard({
  name: "Foggy Swamp Spirit Keeper",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Druid", "Ally"],
  power: 2,
  toughness: 4,
  keywords: ["lifelink"],
  text: `Lifelink\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "create-token", token: "Spirit Token (Colorless, Evasive)", count: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
