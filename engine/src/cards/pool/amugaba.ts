import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 29825.

export default defineCard({
  name: "Amugaba",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: "Flying\n{2}{U}, Discard a card: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{2}{U}, Discard a card: Return this creature to its owner's hand.",
    },
  ],
});
