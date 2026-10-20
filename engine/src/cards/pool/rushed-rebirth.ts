import { defineCard } from "../define.js";

// EDHREC rank 8720.
//
// Rulings:
//   [2021-04-16] If you choose a creature or search for a creature card with {X} in its mana cost,
//     X is considered to be 0.
//
// The delayed trigger is Grim Javelineer's "when that creature dies this
// turn"; the search reads the mana value of the card that died — the trigger
// object, now in its owner's graveyard, where {X} is 0 (rule 107.3).
export default defineCard({
  name: "Rushed Rebirth",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
  types: ["instant"],
  text: "Choose target creature. When that creature dies this turn, search your library for a creature card with lesser mana value, put it onto the battlefield tapped, then shuffle.",
  targets: ["creature"],
  effect: {
    kind: "delayed-trigger",
    at: { leaves: 0, to: ["graveyard"], thisTurn: true },
    text: "When that creature dies this turn, search your library for a creature card with lesser mana value, put it onto the battlefield tapped, then shuffle.",
    effect: {
      kind: "search-library",
      filter: {
        type: "creature",
        manaValue: { op: "lt", n: { amount: { manaValueOf: "trigger-object" } } },
      },
      destination: "battlefield",
      enterTapped: true,
      min: 0,
      max: 1,
    },
  },
});
