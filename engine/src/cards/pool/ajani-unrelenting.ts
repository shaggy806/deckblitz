import { defineCard } from "../define.js";

// EDHREC rank 11152.
// Makes Cadet → use "Cadet".
//
// Rulings:
//   [2026-08-21] The creature token created by Ajani's first ability will always enter the
//     battlefield before the loyalty ability that caused it to trigger resolves. Importantly, this
//     means that if you activate his first loyalty ability, the token created will get +1/+0 and
//     gain haste until end of turn.

export default defineCard({
  name: "Ajani Unrelenting",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ajani"],
  loyalty: 5,
  text: "Whenever you activate a loyalty ability, create a 2/2 colorless Wizard Soldier creature token named Cadet.\n+1: Creatures you control get +1/+0 and gain haste until end of turn.\n−2: Discard your hand, then draw a card for each creature you control.\n−3: Ajani deals 4 damage to each creature except for tokens you control.",
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "modify-pt-all",
            filter: { type: "creature", controlledBy: "you" },
            power: 1,
            toughness: 0,
            duration: "end-of-turn",
          },
          {
            kind: "grant-keyword-all",
            filter: { type: "creature", controlledBy: "you" },
            keyword: "haste",
            duration: "end-of-turn",
          },
        ],
      },
      resolve: null,
      text: "+1: Creatures you control get +1/+0 and gain haste until end of turn.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard-hand", who: "you" },
          { kind: "draw", amount: { countOf: { type: "creature", controlledBy: "you" } } },
        ],
      },
      resolve: null,
      text: "−2: Discard your hand, then draw a card for each creature you control.",
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "damage-all",
        // "Except for tokens you control": every nontoken creature, and an
        // opponent's tokens.
        filter: { anyOf: [{ type: "creature", token: false }, { type: "creature", controlledBy: "opponent" }] },
        amount: 4,
      },
      resolve: null,
      text: "−3: Ajani deals 4 damage to each creature except for tokens you control.",
    },
  ],
  triggered: [
    {
      // On the stack above the loyalty ability, so the Cadet is there for
      // the +1 (the ruling).
      trigger: { on: "activates-ability", who: "you", loyalty: true },
      targets: [],
      effect: { kind: "create-token", token: "Cadet", count: 1 },
      resolve: null,
      text: "Whenever you activate a loyalty ability, create a 2/2 colorless Wizard Soldier creature token named Cadet.",
    },
  ],
});
