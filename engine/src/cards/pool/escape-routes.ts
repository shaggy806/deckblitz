import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 30766.

const TEXT = "{2}{U}: Return target white or black creature you control to its owner's hand.";

export default defineCard({
  name: "Escape Routes",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["W"] }, { colors: ["B"] }] },
        },
      ],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
