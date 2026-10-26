import { defineCard } from "../define.js";

// EDHREC rank 15523.

const CREATURES = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Minions' Murmurs",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "You draw X cards and you lose X life, where X is the number of creatures you control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: CREATURES },
      { kind: "lose-life", amount: CREATURES, who: "you" },
    ],
  },
});
