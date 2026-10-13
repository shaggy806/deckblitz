import { defineCard } from "../define.js";

// EDHREC rank 7118.
//
// Rulings:
//   [2026-01-27] To double the number of a kind of counters on a permanent, put a number of that
//     kind of counters on it equal to the number it already has. Other cards that interact with
//     putting counters on it will interact with this effect accordingly.
//
// Rishkar's "each of up to two target creatures" stretched to four distinct
// optional slots; the doubling is Deepglow Skate's `double-counters`.
const ENTER_TEXT = "When this artifact enters, put a +1/+1 counter on each of up to four target creatures.";
const DOUBLE_TEXT = "{2}, {T}, Sacrifice a token: Double the number of each kind of counter on target creature.";

export default defineCard({
  name: "Arcade Cabinet",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${ENTER_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        { kind: "optional", of: "creature" },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1] } } },
        { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0, 1, 2] } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 2, counter: "+1/+1", amount: 1 },
          { kind: "add-counter", target: 3, counter: "+1/+1", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { token: true } } },
      targets: ["creature"],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
