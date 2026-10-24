import { defineCard } from "../define.js";

// EDHREC rank 23742.

export default defineCard({
  name: "Valeron Wardens",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 1,
  toughness: 3,
  text: "Renown 2 (When this creature deals combat damage to a player, if it isn't renowned, put two +1/+1 counters on it and it becomes renowned.)\nWhenever a creature you control becomes renowned, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 2 },
      resolve: null,
      text: "Renown 2 (When this creature deals combat damage to a player, if it isn't renowned, put two +1/+1 counters on it and it becomes renowned.)",
    },
    {
      trigger: { on: "becomes-renowned", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever a creature you control becomes renowned, draw a card.",
    },
  ],
});
