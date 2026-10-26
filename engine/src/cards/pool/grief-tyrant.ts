import { defineCard } from "../define.js";

// EDHREC rank 26328. Shadowmoor.
//
// Rulings:
//   [2008-05-01] The triggered ability is mandatory. If you’re the only player who controls any
//     creatures when it triggers, you must target one of them.
//
// Soulstinger's shape without the "may": the counters it died with (last-known information).

const DIES_TEXT =
  "When this creature dies, put a -1/-1 counter on target creature for each -1/-1 counter on this creature.";

export default defineCard({
  name: "Grief Tyrant",
  manaCost: "{5}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 8,
  toughness: 8,
  text: `This creature enters with four -1/-1 counters on it.\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: { countersOn: "source", counter: "-1/-1" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 4 } },
      text: "This creature enters with four -1/-1 counters on it.",
    },
  ],
});
