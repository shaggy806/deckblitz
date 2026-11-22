import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 19001.
//
// "That player" is the opponent who cast the green spell; they aren't
// targeted, so their hand is looked at even if they've gained hexproof.

const TRIGGER_TEXT =
  "Whenever an opponent casts a green spell, you may pay {B}{B}. If you do, look at that player's hand and choose a card from it. The player discards that card.";

export default defineCard({
  name: "Leshrac's Sigil",
  manaCost: "{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n{B}{B}: Return this enchantment to its owner's hand.`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["G"] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B}{B} to look at that player's hand and choose a card for them to discard?",
        cost: "{B}{B}",
        effect: { kind: "discard-chosen", target: "trigger-controller", lookOnly: true },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{B}{B}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{B}{B}: Return this enchantment to its owner's hand.",
    },
  ],
});
