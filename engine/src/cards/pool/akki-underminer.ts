import { defineCard } from "../define.js";

// EDHREC rank 23368.

const TEXT = "Whenever this creature deals combat damage to a player, that player sacrifices a permanent of their choice.";

export default defineCard({
  name: "Akki Underminer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Rogue", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
