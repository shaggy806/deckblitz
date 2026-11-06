import { defineCard } from "../define.js";

// EDHREC rank 32508.
//
// The total power is read as the trigger resolves, after the +1/+0 — the
// "then" orders it.

const COMBAT_TEXT =
  "At the beginning of combat on your turn, target creature you control gets +1/+0 until end of turn. Then that creature gains menace until end of turn if creatures you control have total power 8 or greater.";

export default defineCard({
  name: "Cantankerous Captain",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tellarite", "Officer"],
  power: 2,
  toughness: 3,
  text: `${COMBAT_TEXT} (It can't be blocked except by two or more creatures.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          {
            kind: "conditional",
            condition: {
              kind: "aggregate",
              value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
              compare: { op: "gte", n: 8 },
            },
            then: { kind: "grant-keyword", target: 0, keyword: "menace", duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
