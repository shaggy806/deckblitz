import { defineCard } from "../define.js";

// The second ability reaches only the creature cards in the graveyard as it resolves
// (rule 611.2c), and lasts until end of turn whatever becomes of the Locker.
const ESCAPE_TEXT =
  '{T}: Until end of turn, each creature card in your graveyard gains "Escape—{3}{B}, Exile four other cards from your graveyard." (You may cast a card with escape from your graveyard for its escape cost.)';

export default defineCard({
  name: "The Grim Captain's Locker",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["artifact"],
  supertypes: ["legendary"],
  text: `{T}: Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\n${ESCAPE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "{T}: Surveil 1.",
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "grant-graveyard-keyword",
        filter: { type: "creature" },
        grant: { keyword: "escape", cost: "{3}{B}", exileCount: 4 },
      },
      resolve: null,
      text: ESCAPE_TEXT,
    },
  ],
});
