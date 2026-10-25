import { defineCard } from "../define.js";

// EDHREC rank 28792.

const TEXT =
  "Whenever this creature deals combat damage to a player, if you control a Swamp, you may have that player discard a card.";

export default defineCard({
  name: "Slavering Nulls",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Zombie"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Swamp" }, atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have that player discard a card?",
        effect: { kind: "discard", target: "trigger-player", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
