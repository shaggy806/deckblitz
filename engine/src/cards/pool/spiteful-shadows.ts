import { defineCard } from "../define.js";

// EDHREC rank 22748.
//
// Rulings:
//   [2011-01-22] Spiteful Shadows causes the enchanted creature to deal damage to its controller.
//     Abilities like lifelink and infect will apply.
//
// Binding Agony's trigger, with the enchanted creature (the trigger object)
// as the damage's source rather than the Aura — so its lifelink and infect
// apply, as the ruling says.

const TEXT = "Whenever enchanted creature is dealt damage, it deals that much damage to its controller.";

export default defineCard({
  name: "Spiteful Shadows",
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
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-player", from: "trigger-object" },
      resolve: null,
      text: TEXT,
    },
  ],
});
