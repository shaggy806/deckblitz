import { defineCard } from "../define.js";

// Rivals of Ixalan (RIX). EDHREC rank 12841. Goldmeadow Stalwart's
// "reveal a [kind] card or pay {3}" (rule 601.2b), with an enters draw.

const DRAW_TEXT = "When this creature enters, draw a card.";

export default defineCard({
  name: "Silvergill Adept",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  additionalCost: {
    options: [
      { text: "Reveal a Merfolk card", behold: { filter: { subtype: "Merfolk" }, text: "a Merfolk card", fromHand: true } },
      { text: "Pay {3}", mana: "{3}" },
    ],
  },
  text: `As an additional cost to cast this spell, reveal a Merfolk card from your hand or pay {3}.\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
