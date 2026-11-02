import { defineCard } from "../define.js";

const ATTACK = "Whenever a creature attacks enchanted player, put a +1/+1 counter on it.";

export default defineCard({
  name: "Curse of Predation",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  text: `Enchant player\n${ATTACK}`,
  targets: ["player"],
  triggered: [
    {
      trigger: { on: "attacks", who: "any", attackedPlayer: "attached" },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK,
    },
  ],
});
