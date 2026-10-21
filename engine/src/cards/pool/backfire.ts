import { defineCard } from "../define.js";

// Legends. EDHREC rank 23258.
//
// "You" is Backfire's controller; the damage goes to the enchanted creature's
// controller (as it last existed, if it has left), from the Aura.
const TEXT =
  "Whenever enchanted creature deals damage to you, this Aura deals that much damage to that creature's controller.";

export default defineCard({
  name: "Backfire",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", to: "you" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
