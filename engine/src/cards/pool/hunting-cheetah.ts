import { defineCard } from "../define.js";

// Portal Three Kingdoms (PTK). EDHREC rank 22903.
//
// Rulings:
//   [2004-10-04] Because the "search" requires you to find a card with certain characteristics,
//     you don't have to find the card if you don't want to.
//   [2009-10-01] Hunting Cheetah's ability allows you to search your library for any card with the
//     land type Forest, not just a card with the name Forest.

const TEXT =
  "Whenever this creature deals damage to an opponent, you may search your library for a Forest card, reveal that card, put it into your hand, then shuffle.";

export default defineCard({
  name: "Hunting Cheetah",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Forest card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Forest" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
