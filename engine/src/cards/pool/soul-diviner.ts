import { defineCard } from "../define.js";

// EDHREC rank 8926.

export default defineCard({
  name: "Soul Diviner",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Wizard"],
  power: 2,
  toughness: 3,
  text: "{T}, Remove a counter from an artifact, creature, land, or planeswalker you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: {
          kind: "any",
          count: 1,
          from: { typesAnyOf: ["artifact", "creature", "land", "planeswalker"] },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Remove a counter from an artifact, creature, land, or planeswalker you control: Draw a card.",
    },
  ],
});
