import { defineCard } from "../define.js";

// EDHREC rank 6777.

export default defineCard({
  name: "Ghost Town",
  colors: [],
  types: ["land"],
  text: "{T}: Add {C}.\n{0}: Return this land to its owner's hand. Activate only if it's not your turn.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
    {
      cost: { mana: "{0}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      condition: { kind: "not", of: { kind: "your-turn" } },
      text: "{0}: Return this land to its owner's hand. Activate only if it's not your turn.",
    },
  ],
});
