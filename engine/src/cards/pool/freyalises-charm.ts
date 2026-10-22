import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 29921.

const TRIGGER_TEXT = "Whenever an opponent casts a black spell, you may pay {G}{G}. If you do, you draw a card.";

export default defineCard({
  name: "Freyalise's Charm",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${TRIGGER_TEXT}\n{G}{G}: Return this enchantment to its owner's hand.`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "may", prompt: "Pay {G}{G} to draw a card?", cost: "{G}{G}", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{G}{G}: Return this enchantment to its owner's hand.",
    },
  ],
});
