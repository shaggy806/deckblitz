import { defineCard } from "../define.js";

const DISCARD =
  "Sacrifice this enchantment: Look at target player's hand and choose a card from it. That player discards that card. Activate only as a sorcery.";

export default defineCard({
  name: "Seer's Vision",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: `Your opponents play with their hands revealed.\n${DISCARD}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "discard-chosen", target: 0, lookOnly: true },
      resolve: null,
      text: DISCARD,
      sorcerySpeed: true,
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
