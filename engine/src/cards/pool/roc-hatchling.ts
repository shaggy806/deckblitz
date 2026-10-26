import { defineCard } from "../define.js";

// Weatherlight (WTH). EDHREC rank 30029.

const ENTERS_TEXT = "This creature enters with four shell counters on it.";
const UPKEEP_TEXT = "At the beginning of your upkeep, remove a shell counter from this creature.";
const STATIC_TEXT = "As long as this creature has no shell counters on it, it gets +3/+2 and has flying.";

export default defineCard({
  name: "Roc Hatchling",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 0,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${UPKEEP_TEXT}\n${STATIC_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "shell", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shell", amount: 4 } },
      text: ENTERS_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "shell", compare: { op: "eq", n: 0 } },
      grantPt: [3, 2],
      grantKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
});
