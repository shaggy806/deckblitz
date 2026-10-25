import { defineCard } from "../define.js";

// EDHREC rank 30583.

export default defineCard({
  name: "Firefiend Elemental",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 2,
  keywords: ["haste"],
  text: "Haste (This creature can attack and {T} as soon as it comes under your control.)\nRenown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "source", filter: { renowned: false } },
      targets: [],
      effect: { kind: "renown", amount: 1 },
      resolve: null,
      text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)",
    },
  ],
});
