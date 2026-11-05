import { defineCard } from "../define.js";

// EDHREC rank 25375.

export default defineCard({
  name: "Timbermare",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Horse"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text: "Haste\nEcho {5}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, tap all other creatures.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{5}{G}", text: "Pay {5}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {5}{G} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature" },
        exceptSource: true,
        simultaneous: true,
        effect: { kind: "tap", target: 0 },
      },
      resolve: null,
      text: "When this creature enters, tap all other creatures.",
    },
  ],
});
