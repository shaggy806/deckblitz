import { defineCard } from "../define.js";

// EDHREC rank 13311.
//
// Rulings:
//   [2020-06-23] If the target creature is an illegal target by the time Liliana's second ability
//     tries to resolve, the ability won't resolve. No player loses 2 life. If the target is legal
//     but not destroyed (most likely because it has indestructible), its controller does lose 2
//     life.

export default defineCard({
  name: "Liliana, Death Mage",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Liliana"],
  loyalty: 4,
  text: "+1: Return up to one target creature card from your graveyard to your hand.\n−3: Destroy target creature. Its controller loses 2 life.\n−7: Target opponent loses 2 life for each creature card in their graveyard.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: "+1: Return up to one target creature card from your graveyard to your hand.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "lose-life", amount: 2, toControllerOfTarget: 0 },
        ],
      },
      resolve: null,
      text: "−3: Destroy target creature. Its controller loses 2 life.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "lose-life",
        target: 0,
        amount: { product: [2, { countInGraveyard: { type: "creature", ownedBy: "you" }, forTarget: 0 }] },
      },
      resolve: null,
      text: "−7: Target opponent loses 2 life for each creature card in their graveyard.",
    },
  ],
});
