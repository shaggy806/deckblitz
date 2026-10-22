import { defineCard } from "../define.js";

export default defineCard({
  name: "River Hoopoe",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{3}{G}{U}: You gain 2 life and draw a card.",
  activated: [
    {
      cost: { mana: "{3}{G}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{3}{G}{U}: You gain 2 life and draw a card.",
    },
  ],
});
