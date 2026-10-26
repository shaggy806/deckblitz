import { defineCard } from "../define.js";

// Return to Ravnica. EDHREC rank 26256.

const DISCARD_TEXT = "Whenever this creature deals combat damage to a player, that player discards a card at random.";

export default defineCard({
  name: "Rakdos Ringleader",
  manaCost: "{4}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${DISCARD_TEXT}\n{B}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1, random: true },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
