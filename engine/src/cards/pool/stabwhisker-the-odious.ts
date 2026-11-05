import { defineCard } from "../define.js";

const TEXT = "At the beginning of each opponent's upkeep, that player loses 1 life for each card fewer than three in their hand.";

export default defineCard({
  name: "Stabwhisker the Odious",
  art: "https://cards.scryfall.io/art_crop/front/c/8/c8265c39-d287-4c5a-baba-f2f09dd80a1c.jpg",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Shaman"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: { kind: "lose-life", amount: { difference: [3, { cardsInHand: "active-player" }] }, who: "active-player" },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Nezumi Shortfang", "Stabwhisker the Odious"],
  flip: true,
});
