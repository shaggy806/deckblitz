import { defineCard } from "../define.js";

// +3 is Perforating Artist's punisher: each opponent, in turn order, sacrifices
// a nonland permanent, discards a card, or loses 3 life (always open to them —
// its ruling). −3 draws even if the creature isn't destroyed, but not if the
// target is illegal (its ruling: the ability doesn't resolve).
const PLUS_TEXT =
  "+3: Each opponent loses 3 life unless that player sacrifices a nonland permanent of their choice or discards a card.";
const MINUS_TEXT = "−3: Destroy target creature. Draw a card.";
const ULT_TEXT = "−11: Nicol Bolas deals 7 damage to each opponent. You draw seven cards.";

export default defineCard({
  name: "Nicol Bolas, the Deceiver",
  manaCost: "{5}{U}{B}{R}",
  colors: ["U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Bolas"],
  loyalty: 5,
  text: `${PLUS_TEXT}\n${MINUS_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        options: [
          { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
          { discard: 1, text: "Discard a card" },
        ],
        ifDidnt: { kind: "lose-life", amount: 3, who: "that-player" },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "destroy", target: 0 }, { kind: "draw", amount: 1 }],
      },
      resolve: null,
      text: MINUS_TEXT,
    },
    {
      loyaltyCost: -11,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "damage", amount: 7, who: "each-opponent" }, { kind: "draw", amount: 7 }],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
