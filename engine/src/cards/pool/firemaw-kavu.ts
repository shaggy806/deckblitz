import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 25856.

export default defineCard({
  name: "Firemaw Kavu",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 4,
  toughness: 2,
  text: "Echo {5}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, it deals 2 damage to target creature.\nWhen this creature leaves the battlefield, it deals 4 damage to target creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{5}{R}", text: "Pay {5}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {5}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to target creature.",
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature leaves the battlefield, it deals 4 damage to target creature.",
    },
  ],
});
