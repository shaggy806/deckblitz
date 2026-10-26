import { defineCard } from "../define.js";

// Rulings:
//   This is not a draw.

export default defineCard({
  name: "Raven Familiar",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nEcho {2}{U} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{2}{U}", text: "Pay {2}{U}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {2}{U} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 3,
        min: 1,
        max: 1,
        destination: "hand",
        leftover: "bottom-any-order",
      },
      resolve: null,
      text: "When this creature enters, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
    },
  ],
});
