import { defineCard } from "../define.js";

// Urza's Saga. Mills what's there with fewer than two left; never a draw, so
// no loss from it (the rulings).
export default defineCard({
  name: "Whetstone",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: "{3}: Each player mills two cards.",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "mill", target: "each-player", amount: 2 },
      resolve: null,
      text: "{3}: Each player mills two cards.",
    },
  ],
});
