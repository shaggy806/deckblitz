import { defineCard } from "../define.js";

export default defineCard({
  name: "Wisedrafter's Will",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "Your opponents play with their hands revealed.\n{U}, Sacrifice Wisedrafter's Will: Draw a card.\n{U}{U}, Sacrifice Wisedrafter's Will: Counter target spell.",
  activated: [
    {
      cost: { mana: "{U}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{U}, Sacrifice Wisedrafter's Will: Draw a card.",
    },
    {
      cost: { mana: "{U}{U}", tap: false, sacrifice: "self" },
      targets: ["spell"],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{U}{U}, Sacrifice Wisedrafter's Will: Counter target spell.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      visibility: { handsRevealed: "opponents" },
      text: "Your opponents play with their hands revealed.",
    },
  ],
});
