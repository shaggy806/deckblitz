import { defineCard } from "../define.js";

// EDHREC rank 20364.

export default defineCard({
  name: "Blossom Prancer",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["reach"],
  text: "Reach\nWhen this creature enters, look at the top five cards of your library. You may reveal a creature or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, you gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "look-and-choose",
            zone: "library",
            count: 5,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { typesAnyOf: ["creature", "enchantment"] },
            destination: "hand",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "gain-life", amount: 4 },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, look at the top five cards of your library. You may reveal a creature or enchantment card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, you gain 4 life.",
    },
  ],
});
