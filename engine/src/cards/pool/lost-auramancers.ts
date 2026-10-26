import { defineCard } from "../define.js";

// EDHREC rank 16003. Future Sight.
//
// Vanishing 3 as Soultether Golem writes it. "If it had no time counters on
// it" reads the creature as it last existed on the battlefield (Unstoppable
// Slasher's `self-counters` on a dies trigger).

const DIES_TEXT =
  "When this creature dies, if it had no time counters on it, you may search your library for an enchantment card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Lost Auramancers",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: `Vanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
      resolve: null,
      text: "At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
    },
    {
      trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: "When the last time counter is removed from this permanent, sacrifice it.",
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an enchantment card?",
        effect: {
          kind: "search-library",
          filter: { type: "enchantment" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "time", amount: 3 } },
      text: "Vanishing 3 (This permanent enters with 3 time counters on it.)",
    },
  ],
});
