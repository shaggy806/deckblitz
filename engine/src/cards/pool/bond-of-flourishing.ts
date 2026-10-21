import { defineCard } from "../define.js";

// EDHREC rank 18107. The life is gained whether or not a card was taken (the
// ruling).

export default defineCard({
  name: "Bond of Flourishing",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Look at the top three cards of your library. You may reveal a permanent card from among them and put it into your hand. Put the rest on the bottom of your library in any order. You gain 3 life.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      { kind: "gain-life", amount: 3 },
    ],
  },
});
