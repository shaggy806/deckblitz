import { defineCard } from "../define.js";

// EDHREC rank 23081.
//
// Rulings:
//   [2023-02-04] Untapping Lattice-Blade Mantis as its last ability resolves doesn't remove it
//     from combat.
//
// Guiding Hydra's shape: the "may" is offered only while it's still here with an oil counter to
// remove, so "if you do" is exactly a counter removed.

const ENTERS_TEXT = "This creature enters with two oil counters on it.";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may remove an oil counter from it. If you do, untap it and it gets +1/+1 until end of turn.";

export default defineCard({
  name: "Lattice-Blade Mantis",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Insect"],
  power: 4,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "oil", amount: 2 } },
      text: ENTERS_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: {
          kind: "all",
          of: [
            { kind: "source-on-battlefield" },
            { kind: "self-counters", counter: "oil", compare: { op: "gte", n: 1 } },
          ],
        },
        then: {
          kind: "may",
          prompt: "Remove an oil counter from Lattice-Blade Mantis to untap it and give it +1/+1?",
          effect: { kind: "remove-counter", target: "source", counter: "oil", amount: 1 },
          then: {
            kind: "sequence",
            effects: [
              { kind: "untap", target: "source" },
              { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
            ],
          },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
