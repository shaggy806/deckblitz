import { defineCard } from "../define.js";

// EDHREC rank 8087.
//
// Rulings:
//   [2021-11-19] If you choose not to reveal the card you looked at with Sorin's first loyalty
//     ability, it stays on top of your library.
//
// +1: Dark Confidant's look-and-choose made optional ("you may reveal"): the
// life loss is its `then`, which runs only when the card was taken.

const PLUS_TEXT =
  "+1: Look at the top card of your library. You may reveal that card and put it into your hand. If you do, you lose life equal to its mana value.";
const MINUS_TWO_TEXT = "−2: Create a 2/3 black Vampire creature token with flying and lifelink.";
const ULT_TEXT = "−7: Sorin deals 13 damage to any target. You gain 13 life.";

export default defineCard({
  name: "Sorin the Mirthless",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Sorin"],
  loyalty: 4,
  text: `${PLUS_TEXT}\n${MINUS_TWO_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        reveal: "chosen",
        min: 0,
        max: 1,
        destination: "hand",
        leftover: "stay",
        then: { kind: "lose-life", who: "you", amount: { manaValueOf: 0 } },
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Vampire Token (Sorin the Mirthless)", count: 1 },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 13, target: 0 },
          { kind: "gain-life", amount: 13 },
        ],
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
