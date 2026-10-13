import { defineCard } from "../define.js";

// EDHREC rank 7098.
//
// Rulings:
//   [2008-04-01] If Bramblewood Paragon enters at the same time as another Warrior (due to Living
//     End, for example), that creature doesn't get a +1/+1 counter.
//   [2008-04-01] The effects from more than one Bramblewood Paragon are cumulative. That is, if
//     you have more than one Bramblewood Paragon on the battlefield, Warrior creatures you control
//     enter with that many additional +1/+1 counters on them.
//   [2008-04-01] If a Warrior would normally enter with a certain number of +1/+1 counters on it,
//     it enters with that many +1/+1 counters plus one on it instead. If a Warrior would normally
//     enter with no +1/+1 counters on it, it enters with one +1/+1 counter on it instead.
//   [2008-04-01] The creature gets the counter if it would enter under your control. It doesn't
//     matter who owns the creature or what zone it enters from (such as your opponent's graveyard,
//     for example).
//
// Slinza's replacement (a Warrior, not a Beast) and Drix Fatemaker's trample.
const COUNTER_TEXT = "Each other Warrior creature you control enters with an additional +1/+1 counter on it.";
const TRAMPLE_TEXT = "Each creature you control with a +1/+1 counter on it has trample.";

export default defineCard({
  name: "Bramblewood Paragon",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${COUNTER_TEXT}\n${TRAMPLE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", subtype: "Warrior", controlledBy: "you" },
        counters: { kind: "+1/+1", amount: 1 },
      },
      text: COUNTER_TEXT,
    },
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["trample"],
      text: TRAMPLE_TEXT,
    },
  ],
});
