import { defineCard } from "../define.js";

// EDHREC rank 21075.

export default defineCard({
  name: "Flooded Shoreline",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: "{U}{U}, Return two Islands you control to their owner's hand: Return target creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false, returnToHand: { count: 2, filter: { subtype: "Island" } } },
      targets: ["creature"],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: "{U}{U}, Return two Islands you control to their owner's hand: Return target creature to its owner's hand.",
    },
  ],
});
