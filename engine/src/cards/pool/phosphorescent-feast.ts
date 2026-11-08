import { defineCard } from "../define.js";

// Any number revealed, the player's own choice; the symbols of what was shown.
export default defineCard({
  name: "Phosphorescent Feast",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Chroma — Reveal any number of cards in your hand. You gain 2 life for each green mana symbol in those cards' mana costs.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: { cardsInHand: "you" },
        destination: "reveal",
        leftover: "stay",
      },
      {
        kind: "gain-life",
        amount: { product: [2, { aggregate: "sum", of: { manaSymbols: "G" }, filter: {}, in: { thisWay: "revealed", who: "you" } }] },
      },
    ],
  },
});
