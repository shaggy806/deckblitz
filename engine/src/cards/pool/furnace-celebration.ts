import { defineCard } from "../define.js";

const TEXT =
  "Whenever you sacrifice another permanent, you may pay {2}. If you do, this enchantment deals 2 damage to any target.";

export default defineCard({
  name: "Furnace Celebration",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", otherOnly: true },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {2} to have Furnace Celebration deal 2 damage?",
        cost: "{2}",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
