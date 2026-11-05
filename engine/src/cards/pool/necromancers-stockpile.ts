import { defineCard } from "../define.js";

// EDHREC rank 16954.
// Makes Zombie → use "Zombie Token".

export default defineCard({
  name: "Necromancer's Stockpile",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "{1}{B}, Discard a creature card: Draw a card. If the discarded card was a Zombie card, create a tapped 2/2 black Zombie creature token.",
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1, filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "discarded", filter: { subtype: "Zombie" } },
            then: { kind: "create-token", token: "Zombie Token", count: 1, tapped: true },
          },
        ],
      },
      resolve: null,
      text: "{1}{B}, Discard a creature card: Draw a card. If the discarded card was a Zombie card, create a tapped 2/2 black Zombie creature token.",
    },
  ],
});
