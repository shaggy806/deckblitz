import { defineCard } from "../define.js";

// EDHREC rank 7794.
//
// The energy is a `may`'s `costEnergy`, read as it applies: the target's
// mana value then (0 for a token or an {X} at 0 — payable as nothing, the
// ruling). An illegal target stops the whole spell, energy and all.

export default defineCard({
  name: "Confiscation Coup",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Choose target artifact or creature. You get {E}{E}{E}{E} (four energy counters), then you may pay an amount of {E} equal to that permanent's mana value. If you do, gain control of it.",
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
