import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 27922. "Tap an untapped blue creature you
// control" is Grand Architect's `tapOthers` cost.

const SAC_TEXT = "Sacrifice an Island: Put two polyp counters on this enchantment.";
const PUMP_TEXT =
  "{U}, Tap an untapped blue creature you control, Remove a polyp counter from this enchantment: Put a +0/+1 counter on target creature.";

export default defineCard({
  name: "Coral Reef",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `This enchantment enters with four polyp counters on it.\n${SAC_TEXT}\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Island" } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "polyp", amount: 2 },
      resolve: null,
      text: SAC_TEXT,
    },
    {
      cost: {
        mana: "{U}",
        tap: false,
        tapOthers: { count: 1, filter: { type: "creature", colors: ["U"], controlledBy: "you" } },
        removeCounter: { kind: "polyp", count: 1 },
      },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+0/+1", amount: 1 },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "polyp", amount: 4 } },
      text: "This enchantment enters with four polyp counters on it.",
    },
  ],
});
