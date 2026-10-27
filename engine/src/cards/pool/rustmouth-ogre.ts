import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 30378.

export default defineCard({
  name: "Rustmouth Ogre",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre"],
  power: 5,
  toughness: 4,
  text: "Whenever this creature deals combat damage to a player, you may destroy target artifact that player controls.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "artifact" } }],
      effect: {
        kind: "may",
        prompt: "Destroy the target artifact?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, you may destroy target artifact that player controls.",
    },
  ],
});
