import { defineCard } from "../define.js";

// The revealed card goes onto the battlefield if it's a creature card (min 1:
// it isn't optional), and into the graveyard otherwise.

const TEXT =
  "{2}{G}{G}: Reveal the top card of your library. If it's a creature card, put it onto the battlefield. Otherwise, put it into your graveyard.";

export default defineCard({
  name: "Call of the Wild",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "battlefield",
        leftover: "graveyard",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
