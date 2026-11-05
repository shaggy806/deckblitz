import { defineCard } from "../define.js";

// EDHREC rank 10277.
//
// The static is about any creature with a bribery counter, whoever put it there
// (the rulings): the counters stay if Gwafa Hazid leaves, and do nothing until
// another one enters.
const BRIBE_TEXT = "{W}{U}, {T}: Put a bribery counter on target creature you don't control. Its controller draws a card.";
const STATIC_TEXT = "Creatures with bribery counters on them can't attack or block.";

export default defineCard({
  name: "Gwafa Hazid, Profiteer",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  text: `${BRIBE_TEXT}\n${STATIC_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{U}", tap: true },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "bribery", amount: 1 },
          { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
        ],
      },
      resolve: null,
      text: BRIBE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", counters: { kind: "bribery", compare: { op: "gte", n: 1 } } } },
      restrictions: ["cant-attack", "cant-block"],
      text: STATIC_TEXT,
    },
  ],
});
