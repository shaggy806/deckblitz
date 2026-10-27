import { defineCard } from "../define.js";

// Prophecy (PCY). EDHREC rank 29659.
//
// Only the targeted player may pay (not "any player", unlike the other rhystic cards): an
// ordinary punisher with the target as chooser.

const TEXT = "Unless target player pays {3}, that player loses 5 life and you gain 5 life.";

export default defineCard({
  name: "Rhystic Syphon",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "unless",
    chooser: 0,
    options: [{ pay: "{3}", text: "Pay {3}" }],
    otherwise: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", amount: 5, target: 0 },
        { kind: "gain-life", amount: 5 },
      ],
    },
  },
});
