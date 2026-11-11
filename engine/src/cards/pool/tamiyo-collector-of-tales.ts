import { defineCard } from "../define.js";

// Rulings:
//   Tamiyo's ability affects sacrifices, but not any other ways permanents can leave the battlefield.
//   As a spell or ability an opponent controls resolves, if it would force you to sacrifice a
//     permanent or discard a card, you just don't.

const STATIC_TEXT =
  "Spells and abilities your opponents control can't cause you to discard cards or sacrifice permanents.";
const PLUS_TEXT =
  "+1: Choose a nonland card name, then reveal the top four cards of your library. Put all cards with the chosen name from among them into your hand and the rest into your graveyard.";
const MINUS_TEXT = "−3: Return target card from your graveyard to your hand.";

export default defineCard({
  name: "Tamiyo, Collector of Tales",
  manaCost: "{2}{G}{U}",
  colors: ["U", "G"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Tamiyo"],
  loyalty: 5,
  text: `${STATIC_TEXT}\n${PLUS_TEXT}\n${MINUS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: [
        { act: "be-caused", who: "you", what: "discard" },
        { act: "be-caused", who: "you", what: "sacrifice" },
      ],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "choose-card-name",
        filter: { notTypes: ["land"] },
        aim: "own-library",
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 4,
          reveal: true,
          min: 4,
          max: 4,
          filter: { hasName: "$chosenName" },
          destination: "hand",
          leftover: "graveyard",
        },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you" }],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: MINUS_TEXT,
    },
  ],
});
