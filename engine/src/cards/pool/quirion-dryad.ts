import { defineCard } from "../define.js";

// EDHREC rank 25230.
//
// Rulings:
//   [2020-06-23] If you cast a spell that's more than one color, Quirion Dryad's ability triggers
//     just once.
//   [2020-06-23] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.

const TEXT =
  "Whenever you cast a spell that's white, blue, black, or red, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Quirion Dryad",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 1,
  toughness: 1,
  text: TEXT,
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
