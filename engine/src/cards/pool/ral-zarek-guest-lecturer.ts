import { defineCard } from "../define.js";

// Flagged Build ASAP. −7's coins care only about heads and tails (rule 705.2):
// nobody wins them, and X is how many came up heads.
const FLIP_TEXT =
  "−7: Flip five coins. Target opponent skips their next X turns, where X is the number of coins that came up heads.";

export default defineCard({
  name: "Ral Zarek, Guest Lecturer",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Ral"],
  loyalty: 3,
  text:
    "+1: Surveil 2.\n−1: Any number of target players each discard a card.\n−2: Return target creature card with " +
    `mana value 3 or less from your graveyard to the battlefield.\n${FLIP_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "surveil", amount: 2 },
      resolve: null,
      text: "+1: Surveil 2.",
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "any-number", of: "player" }],
      effect: {
        kind: "for-each-target",
        from: 0,
        effect: { kind: "discard", target: 0, amount: 1 },
        simultaneous: true,
      },
      resolve: null,
      text: "−1: Any number of target players each discard a card.",
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      resolve: null,
      text: "−2: Return target creature card with mana value 3 or less from your graveyard to the battlefield.",
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["opponent"],
      effect: {
        kind: "flip-coin",
        count: 5,
        sides: true,
        then: { kind: "skip-turn", who: 0, count: { thisWay: "coins-heads" } },
      },
      resolve: null,
      text: FLIP_TEXT,
    },
  ],
});
