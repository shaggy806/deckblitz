import { defineCard } from "../define.js";

// EDHREC rank 10548.

export default defineCard({
  name: "Relic Seeker",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nWhen this creature becomes renowned, you may search your library for an Equipment card, reveal it, put it into your hand, then shuffle.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 1 },
      resolve: null,
      text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
    },
    {
      trigger: { on: "becomes-renowned", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Equipment card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Equipment" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature becomes renowned, you may search your library for an Equipment card, reveal it, put it into your hand, then shuffle.",
    },
  ],
});
