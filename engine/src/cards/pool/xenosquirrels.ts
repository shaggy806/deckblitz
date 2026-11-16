import { defineCard } from "../define.js";

// EDHREC rank 14184. Each die rolled is "a die" (The Space Family
// Goblinson's ruling), so each gives the shift one chance, a counter apiece
// (rule 706.2a); no once-each-turn limit.

const SHIFT =
  "After you roll a die, you may remove a +1/+1 counter from this creature. If you do, increase or decrease the result by 1.";

export default defineCard({
  name: "Xenosquirrels",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Alien", "Squirrel"],
  power: 0,
  toughness: 0,
  text: `This creature enters with two +1/+1 counters on it.\n${SHIFT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 2 } },
      text: "This creature enters with two +1/+1 counters on it.",
    },
    {
      affects: { scope: "self" },
      shiftsRoll: { by: 1, removeCounter: "+1/+1" },
      text: SHIFT,
    },
  ],
});
