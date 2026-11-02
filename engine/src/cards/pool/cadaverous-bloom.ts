import { defineCard } from "../define.js";

const TEXT = "Exile a card from your hand: Add {B}{B} or {G}{G}.";

export default defineCard({
  name: "Cadaverous Bloom",
  manaCost: "{3}{B}{G}",
  colors: ["B", "G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, exileFromHand: { count: 1 } },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["B", "G"], same: true }, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
