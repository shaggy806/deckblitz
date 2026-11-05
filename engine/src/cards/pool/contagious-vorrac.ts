import { defineCard } from "../define.js";

// EDHREC rank 12879.

export default defineCard({
  name: "Contagious Vorrac",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Boar", "Beast"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, look at the top four cards of your library. You may reveal a land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, proliferate. (Choose any number of permanents and/or players, then give each another counter of each kind already there.)",
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
            count: 4,
            reveal: "chosen",
            min: 0,
            max: 1,
            filter: { type: "land" },
            destination: "hand",
            leftover: "bottom-random",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-into-hand", atMost: 0 },
            then: { kind: "proliferate" },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, look at the top four cards of your library. You may reveal a land card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. If you didn't put a card into your hand this way, proliferate.",
    },
  ],
});
