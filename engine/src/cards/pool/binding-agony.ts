import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 23022.
//
// Repercussion's trigger narrowed to the enchanted creature (Sleep Magic's
// `who: "attached"`): "that much" is the damage dealt, and the trigger player
// is the damaged creature's controller.

const TEXT =
  "Whenever enchanted creature is dealt damage, this Aura deals that much damage to that creature's controller.";

export default defineCard({
  name: "Binding Agony",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: TEXT,
    },
  ],
});
