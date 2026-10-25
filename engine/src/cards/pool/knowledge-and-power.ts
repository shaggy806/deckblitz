import { defineCard } from "../define.js";

const TEXT = "Whenever you scry, you may pay {2}. If you do, this enchantment deals 2 damage to any target.";

// The target is chosen as the trigger goes on the stack; the {2} is asked
// as it resolves (the rulings).
export default defineCard({
  name: "Knowledge and Power",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "scries", who: "you" },
      targets: ["any-target"],
      effect: {
        kind: "may",
        prompt: "Pay {2} to have Knowledge and Power deal 2 damage?",
        cost: "{2}",
        effect: { kind: "damage", amount: 2, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
