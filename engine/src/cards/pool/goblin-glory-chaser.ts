import { defineCard } from "../define.js";

// EDHREC rank 20305.

export default defineCard({
  name: "Goblin Glory Chaser",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Renown 1 (When this creature deals combat damage to a player, if it isn't renowned, put a +1/+1 counter on it and it becomes renowned.)\nAs long as this creature is renowned, it has menace. (It can't be blocked except by two or more creatures.)",
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
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["menace"],
      text: "As long as this creature is renowned, it has menace.",
      condition: { kind: "source", filter: { renowned: true } },
    },
  ],
});
