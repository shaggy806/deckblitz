import { defineCard } from "../define.js";

// EDHREC rank 3988.
//
// Rulings:
//   [2020-04-17] You may choose to move zero counters.
//   [2020-04-17] You choose which counters to move as Slippery Bogbonder's triggered ability
//     resolves.
//   [2020-04-17] You can't move counters from the target creature to itself.
//   [2020-04-17] You may move counters from any number of other creatures you control, not just
//     from one.
//   [2020-04-17] If Slippery Bogbonder's triggered ability puts a hexproof counter on a creature
//     an opponent controls, you can still move counters onto that creature.

export default defineCard({
  name: "Slippery Bogbonder",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 3,
  keywords: ["flash", "hexproof"],
  text: "Flash\nHexproof\nWhen this creature enters, put a hexproof counter on target creature. Then move any number of counters from among creatures you control onto that creature.",
  triggered: [
    {
      // The counters to move are chosen as it resolves (the rulings): one
      // creature you control at a time — never the target itself — and how
      // many of each kind on it, none at all included.
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "hexproof", amount: 1 },
          {
            kind: "move-counters",
            from: {
              // Only one with a counter has any to give.
              choose: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
              prompt: "Choose a creature you control to move counters from (none to stop)",
            },
            to: 0,
            amount: "any",
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, put a hexproof counter on target creature. Then move any number of counters from among creatures you control onto that creature.",
    },
  ],
});
