import { defineCard } from "../define.js";

export default defineCard({
  name: "Yawgmoth's Bargain",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: "Skip your draw step.\nPay 1 life: Draw a card.",
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Pay 1 life: Draw a card.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      skipsSteps: { who: "you", steps: ["draw"] },
      text: "Skip your draw step.",
    },
  ],
});
