import { defineCard } from "../define.js";

// EDHREC rank 17695.
//
// Rulings:
//   [2021-09-24] If you cast a colorless spell, you may choose to discard your hand and draw no
//     cards.
//   [2021-09-24] If you have no cards in hand as the first ability resolves, you may still choose
//     to discard your hand. You'll just draw a card for each of that spell's colors.
//   [2021-09-24] The last ability triggers even if you control no permanents that are one or
//     more colors when it dies. The amount of damage is calculated as the ability resolves.
//
// Discarding an empty hand is still "doing it" (the ruling), so the draw is
// the `may`'s `then` (Jackdaw's shape) rather than gated on cards discarded.
// The death trigger counts colors among the permanents you control as it
// resolves — the Regent itself is gone by then.

const CAST_TEXT =
  "Whenever you cast a spell, you may discard your hand. If you do, draw a card for each of that spell's colors.";
const DIES_TEXT =
  "When this creature dies, it deals X damage to any target, where X is the number of colors among permanents you control.";

export default defineCard({
  name: "Moonveil Regent",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${CAST_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each of that spell's colors?",
        effect: { kind: "discard-hand", who: "you" },
        then: { kind: "draw", amount: { colorsOf: "trigger-object" } },
      },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", target: 0, amount: { colorsAmong: { controlledBy: "you" } } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
