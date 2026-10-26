import { defineCard } from "../define.js";

// EDHREC rank 21231.
//
// Rulings:
//   The ability checks to see if Deadly Grub had no time counters on it at the time it was put into a graveyard from the battlefield. This doesn't necessarily mean it must have been sacrificed due to vanishing; it could have been put into the graveyard some other way (say, while the sacrifice ability of vanishing is on the stack).

export default defineCard({
  name: "Deadly Grub",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 3,
  toughness: 1,
  text: "Vanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhen this creature dies, if it had no time counters on it, create a 6/1 green Insect creature token with shroud. (It can't be the target of spells or abilities.)",
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
      effect: { kind: "create-token", token: "Insect Token (Green, 6/1, Shroud)", count: 1 },
      resolve: null,
      text: "When this creature dies, if it had no time counters on it, create a 6/1 green Insect creature token with shroud.",
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
