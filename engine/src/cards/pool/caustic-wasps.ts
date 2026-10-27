import { defineCard } from "../define.js";

// Mercadian Masques. EDHREC rank 15110.
const TEXT =
  "Whenever this creature deals combat damage to a player, you may destroy target artifact that player controls.";

export default defineCard({
  name: "Caustic Wasps",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
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
      text: TEXT,
    },
  ],
});
