import { defineCard } from "../define.js";

// EDHREC rank 12319.
//
// Rulings:
//   [2007-02-01] Chronozoa's last ability creates two Chronozoa tokens that each enter with three
//     time counters and have all of Chronozoa's abilities.
//   [2007-02-01] If Chronozoa becomes a copy of another creature and is put into the graveyard
//     from the battlefield, no copies will be created. If another creature becomes a copy of
//     Chronozoa and is put into a graveyard from the battlefield (with no time counters on it),
//     two copies of Chronozoa will be created.
//   [2007-02-01] The ability checks to see if Chronozoa had no time counters on it at the time it
//     was put into a graveyard from the battlefield. This doesn't necessarily mean it must have
//     been sacrificed due to vanishing; it could have been put into the graveyard some other way
//     (say, while the sacrifice ability of vanishing is on the stack).

export default defineCard({
  name: "Chronozoa",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Illusion"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nVanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhen this creature dies, if it had no time counters on it, create two tokens that are copies of it.",
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
      // Read as it last existed on the battlefield (rule 603.10a), as Lost
      // Auramancers'; the copies are of it as it last was, and each enters
      // with vanishing's three time counters.
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "time", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 2, who: "you" },
      resolve: null,
      text: "When this creature dies, if it had no time counters on it, create two tokens that are copies of it.",
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
