import { defineCard } from "../define.js";

// "Then look at the top X cards": with no sticker put there is no X to look
// at, so `then` (which only follows a sticker) loses nothing.
export default defineCard({
  name: "Wizards of the _____",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Performer"],
  power: 3,
  toughness: 1,
  text: "When this creature enters, you may put a name sticker on it, then look at the top X cards of your library, where X is the number of unique vowels on that sticker. Put one of those cards into your hand and the rest on the bottom of your library in any order. (The vowels are A, E, I, O, U, and Y.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      resolve: null,
      effect: {
        kind: "put-sticker",
        sticker: "name",
        optional: true,
        count: "unique-vowels",
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: "x",
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "bottom-any-order",
        },
      },
      text: "When this creature enters, you may put a name sticker on it, then look at the top X cards of your library, where X is the number of unique vowels on that sticker. Put one of those cards into your hand and the rest on the bottom of your library in any order.",
    },
  ],
});
