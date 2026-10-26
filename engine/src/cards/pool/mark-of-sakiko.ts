import { defineCard } from "../define.js";

const GRANTED =
  "Whenever this creature deals combat damage to a player, add that much {G}. Until end of turn, you don't lose this mana as steps and phases end.";

export default defineCard({
  name: "Mark of Sakiko",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature has "${GRANTED}"`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsTriggered: [
        {
          trigger: { on: "deals-combat-damage-to-player", who: "self" },
          targets: [],
          effect: { kind: "add-mana", mana: "G", amount: { triggerValue: true }, persists: true },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Enchanted creature has "${GRANTED}"`,
    },
  ],
});
