import { defineCard } from "../define.js";

// EDHREC rank 22764.

export default defineCard({
  name: "Graf Reaver",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Warrior"],
  power: 3,
  toughness: 3,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, destroy target planeswalker.\nAt the beginning of your upkeep, this creature deals 1 damage to you.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exploit: sacrifice a creature?",
        effect: {
          kind: "sacrifice",
          who: "you",
          filter: { type: "creature" },
          count: 1,
          exploit: true,
        },
      },
      resolve: null,
      text: "Exploit",
    },
    {
      trigger: { on: "exploits", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "planeswalker" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "When this creature exploits a creature, destroy target planeswalker.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "you" },
      resolve: null,
      text: "At the beginning of your upkeep, this creature deals 1 damage to you.",
    },
  ],
});
