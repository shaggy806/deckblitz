import { defineCard } from "../define.js";

// EDHREC rank 8661.
//
// Rulings:
//   [2023-09-01] If you cast a spell that's more than one of the listed colors, Questing Druid's
//     ability still triggers only once.
//
// "White, blue, black, or red" is one trigger with an `anyOf` over the
// colours, so a multicoloured spell fires it once.

const TEXT =
  "Whenever you cast a spell that's white, blue, black, or red, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Questing Druid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  faces: ["Questing Druid", "Seek the Beast"],
  adventure: true,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: { anyOf: [{ colors: ["W"] }, { colors: ["U"] }, { colors: ["B"] }, { colors: ["R"] }] },
      },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
