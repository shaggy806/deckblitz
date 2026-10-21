import { defineCard } from "../define.js";

// EDHREC rank 7271.
//
// Melira, Sylvok Outcast's counter prohibition, turned on the opponents'
// creatures: one entering with +1/+1 counters enters without them, and a
// cost that would put them can't be paid (the rulings).
//
// Rulings:
//   [2019-07-12] Creatures your opponents control won't receive +1/+1 counters as they enter the
//     battlefield.
//   [2019-07-12] Blightbeetle doesn't remove any +1/+1 counters already on creatures your
//     opponents control.

const COUNTERS_TEXT = "Creatures your opponents control can't have +1/+1 counters put on them.";

export default defineCard({
  name: "Blightbeetle",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 1,
  toughness: 1,
  text: `Protection from green (This creature can't be blocked, targeted, dealt damage, enchanted, or equipped by anything green.)\n${COUNTERS_TEXT}`,
  static: [
    { affects: { scope: "self" }, protection: { colors: ["G"] }, text: "Protection from green" },
    {
      affects: { scope: "self" },
      preventsCounters: { permanents: { type: "creature", controlledBy: "opponent" }, kind: "+1/+1" },
      text: COUNTERS_TEXT,
    },
  ],
});
