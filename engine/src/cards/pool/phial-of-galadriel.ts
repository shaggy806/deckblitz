import { defineCard } from "../define.js";

// "Draw two cards instead" is one more card for the first card of an
// instruction drawn from an empty hand (the rulings: a draw of two with no
// cards in hand is three; two Phials make a draw of one three, not four), so
// it's the "that many plus one" spelling, which adds up across Phials.

export default defineCard({
  name: "Phial of Galadriel",
  manaCost: "{3}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "If you would draw a card while you have no cards in hand, draw two cards instead.\nIf you would gain life while you have 5 or less life, you gain twice that much life instead.\n{T}: Add one mana of any color.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "hand-size", atMost: 0 },
      replacement: {
        event: "would-draw",
        who: "you",
        instruction: { atLeast: 1 },
        instead: { modify: { plus: 1 } },
      },
      text: "If you would draw a card while you have no cards in hand, draw two cards instead.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atMost: 5 },
      replacement: { event: "would-gain-life", who: "you", instead: { modify: { times: 2 } } },
      text: "If you would gain life while you have 5 or less life, you gain twice that much life instead.",
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
  ],
});
