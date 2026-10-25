import { defineCard } from "../define.js";

// EDHREC rank 14235.

const TEXT =
  "{1}{G}, Sacrifice this enchantment: Reveal the top four cards of your library. You may put an artifact, creature, enchantment, land, or planeswalker card from among them into your hand. Put the rest into your graveyard.";

export default defineCard({
  name: "Vessel of Nascency",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: true,
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "graveyard",
        filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
