import { defineCard } from "../define.js";

// EDHREC rank 32160.
//
// Saprazzan Breaker's "if a land card was milled this way", then a rule on
// the combat damage this creature would deal this turn. "Blocks" triggers
// once however many it blocks (the ruling).

const TEXT =
  "Whenever this creature attacks or blocks, mill a card. If a land card was milled this way, prevent all combat damage this creature would deal this turn.";

const EFFECT = {
  kind: "sequence",
  effects: [
    { kind: "mill", target: "you", amount: 1 },
    {
      kind: "conditional",
      condition: { kind: "this-way", what: "milled", filter: { type: "land" } },
      then: { kind: "damage-rule", by: { target: "source" }, combat: true },
    },
  ],
} as const;

export default defineCard({
  name: "Loafing Giant",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 6,
  text: TEXT,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: EFFECT, resolve: null, text: TEXT },
  ],
});
