import { defineCard } from "../define.js";

// EDHREC rank 18096.
//
// Rulings:
//   [2004-10-04] The “if you do” means “if you search your library”. You get to skip your draw
//     step and shuffle your deck even if you don’t find (or choose not to find) a basic land.
//   [2004-10-04] Because the “search” requires you to find a card with certain characteristics,
//     you don’t have to find the card if you don’t want to.
//   [2004-10-04] If you have more than one of these on the battlefield, you get to use them all
//     and you don’t skip multiple draw steps.

export default defineCard({
  name: "Elfhame Sanctuary",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: "At the beginning of your upkeep, you may search your library for a basic land card, reveal that card, put it into your hand, then shuffle. If you do, you skip your draw step this turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      // "If you do" is "if you search" (the ruling): the skip comes with
      // the search, found or not. Several give one skip (`thisTurn`).
      effect: {
        kind: "may",
        prompt: "Search your library for a basic land card? (You'll skip your draw step this turn.)",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "search-library", filter: { supertype: "basic", type: "land" }, destination: "hand", min: 0, max: 1, reveal: true },
            { kind: "skip-step", step: "draw", who: "you", thisTurn: true },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may search your library for a basic land card, reveal that card, put it into your hand, then shuffle. If you do, you skip your draw step this turn.",
    },
  ],
});
