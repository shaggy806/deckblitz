import { defineCard } from "../define.js";

// "Whenever a creature deals combat damage to enchanted player": the player
// this Curse enchants as the damage is dealt, whoever's creature dealt it,
// once for each creature. "That creature" is the trigger object, acted on only
// while it's the same permanent (rule 400.7).

const TEXT = "Whenever a creature deals combat damage to enchanted player, put a +1/+1 counter on that creature.";

export default defineCard({
  name: "Curse of Stalked Prey",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${TEXT}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "any", filter: { type: "creature" }, toEnchantedPlayer: true },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
