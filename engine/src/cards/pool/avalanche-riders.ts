import { defineCard } from "../define.js";

// EDHREC rank 21005.

export default defineCard({
  name: "Avalanche Riders",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Nomad"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste\nEcho {3}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen this creature enters, destroy target land.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "source-came-under-control-since-last-upkeep" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{3}{R}", text: "Pay {3}{R}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "Echo {3}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["land"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature enters, destroy target land.",
    },
  ],
});
