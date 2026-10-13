import { defineCard } from "../define.js";

/** Colorless Shard enchantment — Niko, Light of Hope's token. */
export default defineCard({
  name: "Shard Token",
  art: "6a198942-049c-4537-b5b1-d35df32d45d5",
  colors: [],
  types: ["enchantment"],
  subtypes: ["Shard"],
  text: "{2}, Sacrifice this enchantment: Scry 1, then draw a card.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}, Sacrifice this enchantment: Scry 1, then draw a card.",
    },
  ],
});
