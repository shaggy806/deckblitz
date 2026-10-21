import { defineCard } from "../define.js";

// EDHREC rank 22471. Ikoria: Lair of Behemoths.
//
// Two intervening-ifs (rule 603.4), each checked as the attack triggers and
// again as it resolves: attacking without first strike, only the first
// triggers (so no double strike that combat, though the counter lands);
// attacking with first strike, only the second. Double strike isn't first strike (rule
// 702.4), so the reads are of the first-strike keyword itself.
const COUNTER_TEXT = "Whenever this creature attacks, if it doesn't have first strike, put a first strike counter on it.";
const DOUBLE_TEXT = "Whenever this creature attacks, if it has first strike, it gains double strike until end of turn.";

export default defineCard({
  name: "Momentum Rumbler",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 3,
  toughness: 3,
  text: `${COUNTER_TEXT}\n${DOUBLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { notKeyword: "first-strike" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "first-strike", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { keyword: "first-strike" } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
