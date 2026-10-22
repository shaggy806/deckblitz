import { defineCard } from "../define.js";

// Ice Age. Psychic Venom's trigger with a punisher on it: the enchanted
// creature's controller (the trigger object's — "trigger-controller") may pay
// {3}; if they don't, the Aura deals them 3 damage.

const TEXT =
  "Whenever enchanted creature becomes tapped, this Aura deals 3 damage to that creature's controller unless that player pays {3}.";

export default defineCard({
  name: "Seizures",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: { kind: "damage", amount: 3, who: "trigger-controller" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
