import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 8918.
//
// "A land card with a basic land type" is any land with one of the five
// basic land types on its type line, basic or not (the ruling: Overgrown
// Tomb, Tropical Island) — Farseek's `subtypes` OR over all five.

const TEXT =
  "{1}, Sacrifice a creature: Search your library for a land card with a basic land type, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Perilous Forays",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", subtypes: ["Plains", "Island", "Swamp", "Mountain", "Forest"] },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
