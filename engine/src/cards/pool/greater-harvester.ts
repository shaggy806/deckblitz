import { defineCard } from "../define.js";

// EDHREC rank 13457.

export default defineCard({
  name: "Greater Harvester",
  manaCost: "{2}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 5,
  toughness: 6,
  text: "At the beginning of your upkeep, sacrifice a permanent.\nWhenever this creature deals combat damage to a player, that player sacrifices two permanents of their choice.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "sacrifice", who: "you", filter: {}, count: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice a permanent.",
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: 2 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, that player sacrifices two permanents of their choice.",
    },
  ],
});
