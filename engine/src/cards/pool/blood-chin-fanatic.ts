import { defineCard } from "../define.js";

// EDHREC rank 21411.
//
// Rulings:
//   [2015-02-25] Use the creature's power as it last existed on the battlefield, including any
//     +1/+1 counters it had, when determining the value of X.

const TEXT =
  "{1}{B}, Sacrifice another Warrior creature: Target player loses X life and you gain X life, where X is the sacrificed creature's power.";

export default defineCard({
  name: "Blood-Chin Fanatic",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{1}{B}",
        tap: false,
        sacrifice: { filter: { type: "creature", subtype: "Warrior" } },
      },
      otherOnly: true,
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", target: 0, amount: { powerOf: "sacrificed" } },
          { kind: "gain-life", amount: { powerOf: "sacrificed" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
