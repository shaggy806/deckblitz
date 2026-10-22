import { defineCard } from "../define.js";

export default defineCard({
  name: "Seer of the Last Tomorrow",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Snake", "Cleric"],
  power: 1,
  toughness: 4,
  text: "{U}, {T}, Discard a card: Target player mills three cards.",
  activated: [
    {
      cost: { mana: "{U}", tap: true, discard: { count: 1 } },
      targets: ["player"],
      effect: { kind: "mill", target: 0, amount: 3 },
      resolve: null,
      text: "{U}, {T}, Discard a card: Target player mills three cards.",
    },
  ],
});
