import { defineCard } from "../define.js";

const yours = { controlledBy: "you" } as const;

// Rule 701.12b: all or nothing. "If you control neither creature" is asked
// after the exchange (the same answer as before it: an exchange between two
// other players leaves you neither, one with you leaves you the other); a
// creature that has left is read as it last existed (rule 608.2h).
export default defineCard({
  name: "Modify Memory",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of two target creatures controlled by different players. If you control neither creature, draw three cards.",
  targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, differentController: true }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exchange-control", objects: [0, 1] },
      {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "not", of: { kind: "target", index: 0, filter: yours } },
            { kind: "not", of: { kind: "target", index: 1, filter: yours } },
          ],
        },
        then: { kind: "draw", amount: 3 },
      },
    ],
  },
});
