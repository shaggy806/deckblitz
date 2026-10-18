import { defineCard } from "../define.js";

// EDHREC rank 23429.

const DIES_TEXT = "When this creature dies, draw cards equal to the number of oil counters on it.";

export default defineCard({
  name: "Watchful Blisterzoa",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Jellyfish"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nThis creature enters with an oil counter on it.\n${DIES_TEXT}`,
  triggered: [
    {
      // The oil counters it had as it last existed on the battlefield.
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countersOn: "source", counter: "oil" } },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 1 } },
      text: "This creature enters with an oil counter on it.",
    },
  ],
});
