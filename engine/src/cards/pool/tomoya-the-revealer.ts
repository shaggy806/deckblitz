import { defineCard } from "../define.js";

export default defineCard({
  name: "Tomoya the Revealer",
  art: "https://cards.scryfall.io/art_crop/front/3/3/33a8e5b9-6bfb-4ff2-a16d-3168a5412807.jpg",
  manaCost: "{1}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: "{3}{U}{U}, {T}: Target player draws X cards, where X is the number of cards in your hand.",
  activated: [
    {
      cost: { mana: "{3}{U}{U}", tap: true },
      targets: ["player"],
      effect: { kind: "draw", amount: { cardsInHand: "you" }, target: 0 },
      resolve: null,
      text: "{3}{U}{U}, {T}: Target player draws X cards, where X is the number of cards in your hand.",
    },
  ],
  faces: ["Jushi Apprentice", "Tomoya the Revealer"],
  flip: true,
});
