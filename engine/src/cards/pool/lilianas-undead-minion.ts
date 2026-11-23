import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2), back face of Liliana's Other Contract.
// Its rulings: nothing makes you lose while you control it, though an
// opponent can still win by an effect that says so.

export default defineCard({
  name: "Liliana's Undead Minion",
  art: "https://cards.scryfall.io/art_crop/back/c/9/c9c1e5c2-8706-4c46-8b25-b045020a3a7f.jpg",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["You"],
  loyalty: 5,
  text: "You can't lose the game.\n+1: Each opponent loses 1 life.\n−4: Destroy target creature.",
  static: [{ affects: { scope: "self" }, prohibits: [{ act: "lose-game", who: "you" }], text: "You can't lose the game." }],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: "+1: Each opponent loses 1 life.",
    },
    {
      loyaltyCost: -4,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "−4: Destroy target creature.",
    },
  ],
  faces: ["Liliana's Other Contract", "Liliana's Undead Minion"],
  transform: true,
});
