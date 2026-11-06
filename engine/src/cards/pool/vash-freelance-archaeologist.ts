import { defineCard } from "../define.js";

export default defineCard({
  name: "Vash, Freelance Archaeologist",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue", "Scientist"],
  power: 2,
  toughness: 4,
  text: "At the beginning of your upkeep, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\nWhenever a card leaves your graveyard, draw a card. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, surveil 1.",
    },
    {
      trigger: { on: "leaves-graveyard", who: "you" },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a card leaves your graveyard, draw a card. This ability triggers only once each turn.",
    },
  ],
});
