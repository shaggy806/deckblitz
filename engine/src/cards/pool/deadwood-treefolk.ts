import { defineCard } from "../define.js";

// EDHREC rank 17134.

const TEXT =
  "When this creature enters or leaves the battlefield, return another target creature card from your graveyard to your hand.";
// "Another": never the Treefolk card itself, even once it's in the graveyard
// (Dutiful Attendant's shape).
const TARGET = {
  kind: "other",
  of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
  than: "source",
} as const;

export default defineCard({
  name: "Deadwood Treefolk",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Treefolk"],
  power: 3,
  toughness: 6,
  text: `Vanishing 3 (This creature enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\n${TEXT}`,
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
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [TARGET],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [TARGET],
      effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      resolve: null,
      text: TEXT,
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
