import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 15783.
const TEXT = "Whenever this creature deals combat damage to a player, that player discards a card and you draw a card.";

export default defineCard({
  name: "Dimir Cutpurse",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "trigger-player", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
