import { defineCard } from "../define.js";

// EDHREC rank 3364.

export default defineCard({
  name: "O'aka, Traveling Merchant",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 1,
  toughness: 2,
  text: "{T}, Remove a counter from a nonland permanent you control: Draw a card.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        removeCounter: { kind: "any", count: 1, from: { notTypes: ["land"] } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Remove a counter from a nonland permanent you control: Draw a card.",
    },
  ],
});
