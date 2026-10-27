import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 32082.

export default defineCard({
  name: "Balshan Griffin",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Griffin"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\n{1}{U}, Discard a card: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{1}{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{1}{U}, Discard a card: Return this creature to its owner's hand.",
    },
  ],
});
