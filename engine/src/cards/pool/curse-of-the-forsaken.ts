import { defineCard } from "../define.js";

const ATTACK = "Whenever a creature attacks enchanted player, its controller gains 1 life.";

export default defineCard({
  name: "Curse of the Forsaken",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${ATTACK}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackedPlayer: "attached" },
      targets: [],
      effect: { kind: "gain-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: ATTACK,
    },
  ],
});
