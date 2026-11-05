import { defineCard } from "../define.js";

// EDHREC rank 11230.
//
// Both exiling abilities link their cards to this Ashiok (the ruling: "any
// creature card exiled because of Ashiok's first or third ability"), and the
// −X's card is chosen as it resolves, with mana value exactly the X paid.

export default defineCard({
  name: "Ashiok, Nightmare Weaver",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ashiok"],
  loyalty: 3,
  text: "+2: Exile the top three cards of target opponent's library.\n−X: Put a creature card with mana value X exiled with Ashiok onto the battlefield under your control. That creature is a Nightmare in addition to its other types.\n−10: Exile all cards from all opponents' hands and graveyards.",
  activated: [
    {
      loyaltyCost: 2,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: { kind: "exile-from-library", whose: 0, amount: 3, linked: true },
      resolve: null,
      text: "+2: Exile the top three cards of target opponent's library.",
    },
    {
      loyaltyCost: "-x",
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "exiled-with-source",
        min: 1,
        max: 1,
        filter: { type: "creature", manaValue: { op: "eq", n: { amount: "x" } } },
        destination: "battlefield",
        enterAs: { addSubtypes: ["Nightmare"] },
        leftover: "stay",
      },
      resolve: null,
      text: "−X: Put a creature card with mana value X exiled with Ashiok onto the battlefield under your control. That creature is a Nightmare in addition to its other types.",
    },
    {
      loyaltyCost: -10,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "exile-graveyard", target: "each-opponent", fromHand: "also", linked: true },
      resolve: null,
      text: "−10: Exile all cards from all opponents' hands and graveyards.",
    },
  ],
});
