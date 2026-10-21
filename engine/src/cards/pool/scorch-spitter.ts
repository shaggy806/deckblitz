import { defineCard } from "../define.js";

// Core Set 2020. Fathom Fleet Swordjack's shape: one removed from combat
// before this resolves isn't attacking anything, so deals nothing.
const ATTACK_TEXT = "Whenever this creature attacks, it deals 1 damage to the player or planeswalker it's attacking.";

export default defineCard({
  name: "Scorch Spitter",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Lizard"],
  power: 1,
  toughness: 1,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { attacking: true } },
        then: { kind: "damage", amount: 1, toTriggerRecipient: true },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
