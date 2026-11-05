import { defineCard } from "../define.js";

// EDHREC rank 16947.
//
// One instruction: everyone and their creatures are dealt it at once (the
// ruling), each player's number read from their own creatures.
const CREATURES_THEY_CONTROL = { countOf: { type: "creature", controlledBy: "you" }, forPlayer: "that-player" } as const;

export default defineCard({
  name: "Incite Rebellion",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "For each player, Incite Rebellion deals damage to that player and each creature that player controls equal to the number of creatures they control.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    simultaneous: true,
    effect: {
      kind: "sequence",
      simultaneous: true,
      effects: [
        { kind: "damage", amount: CREATURES_THEY_CONTROL, who: "that-player" },
        { kind: "damage-all", filter: { type: "creature" }, amount: CREATURES_THEY_CONTROL, whose: "that-player" },
      ],
    },
  },
});
