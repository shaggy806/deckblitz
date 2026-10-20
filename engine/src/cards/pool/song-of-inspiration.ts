import { defineCard } from "../define.js";

// EDHREC rank 17075.
//
// The cards are targeted as it's cast and the d20 rolled as it resolves (the
// ruling), adding their total mana value; both are returned as one event
// (Rydia's Return's shape).
const PERMANENT_CARD = {
  kind: "card-in-graveyard",
  whose: "you",
  filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
} as const;
const TOTAL = { sum: [{ manaValueOf: 0 }, { manaValueOf: 1 }] } as const;
const RETURN = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "return-to-hand", target: 0, from: "graveyard" },
    { kind: "return-to-hand", target: 1, from: "graveyard" },
  ],
} as const;

export default defineCard({
  name: "Song of Inspiration",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Choose up to two target permanent cards in your graveyard. Roll a d20 and add the total mana value of those cards.\n1—14 | Return those cards to your hand.\n15+ | Return those cards to your hand. You gain life equal to their total mana value.",
  targets: [
    { kind: "optional", of: PERMANENT_CARD },
    { kind: "optional", of: { kind: "other", of: PERMANENT_CARD, than: { slots: [0] } } },
  ],
  effect: {
    kind: "roll-dice",
    sides: 20,
    modifier: TOTAL,
    table: [
      { min: 1, max: 14, effect: RETURN },
      { min: 15, effect: { kind: "sequence", effects: [RETURN, { kind: "gain-life", amount: TOTAL }] } },
    ],
  },
});
