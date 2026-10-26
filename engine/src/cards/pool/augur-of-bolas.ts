import { defineCard } from "../define.js";

// Rulings:
//   [2012-07-01] You don't reveal the other two cards, nor do you reveal their order on the bottom
//     of the library.
//   [2012-07-01] If there are fewer than three cards in your library when Augur of Bolas's ability
//     resolves, you'll look at the remaining cards.

const TEXT =
  "When this creature enters, look at the top three cards of your library. You may reveal an instant or sorcery card from among them and put it into your hand. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Augur of Bolas",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { typesAnyOf: ["instant", "sorcery"] },
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
