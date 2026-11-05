import { defineCard } from "../define.js";

// EDHREC rank 14647.

export default defineCard({
  name: "Misty Knight, Hero for Hire",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective", "Hero"],
  power: 3,
  toughness: 1,
  text: "{2}, {T}, Discard a card: Draw a card for each card you've discarded this turn.",
  activated: [
    {
      cost: { mana: "{2}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: { turnHistory: "discarded" } },
      resolve: null,
      text: "{2}, {T}, Discard a card: Draw a card for each card you've discarded this turn.",
    },
  ],
});
