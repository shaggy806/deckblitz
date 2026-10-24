import { defineCard } from "../define.js";

// EDHREC rank 7794.
//
// Rulings:
//   If the target artifact or creature has a mana value of 0, you may choose to pay zero energy
//     and gain control of it.
//   If a permanent has {X} in its mana cost, X is considered to be 0.
//   You choose the target as you cast Confiscation Coup. You don't choose whether or not to pay
//     an amount of {E} until Confiscation Coup resolves. If the target becomes an illegal target,
//     Confiscation Coup won't resolve and you won't get {E}{E}{E}{E}.
//
// The energy comes first, then the `may` whose `costEnergy` is the target's
// mana value as it resolves; the control change has no end.

const TEXT =
  "Choose target artifact or creature. You get {E}{E}{E}{E} (four energy counters), then you may pay an amount of {E} equal to that permanent's mana value. If you do, gain control of it.";

export default defineCard({
  name: "Confiscation Coup",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["artifact-or-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "get-energy", amount: 4 },
      {
        kind: "may",
        prompt: "Pay {E} equal to that permanent's mana value to gain control of it?",
        costEnergy: { manaValueOf: 0 },
        effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
      },
    ],
  },
});
