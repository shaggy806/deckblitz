import { defineCard } from "../define.js";

// Rulings: one trigger per life-gaining event, however much life; {2} paid at
// most once per trigger (Dawn of Hope's shape).
const TEXT =
  "Whenever you gain life, you may pay {2}. If you do, create a 4/4 green Fungus Beast creature token with trample.";

export default defineCard({
  name: "Trudge Garden",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "gains-life", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2} to create a 4/4 Fungus Beast token?",
        cost: "{2}",
        effect: { kind: "create-token", token: "Fungus Beast Token", count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
