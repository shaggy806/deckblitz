import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 18350.

export default defineCard({
  name: "Dutiful Return",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to your hand.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, { optional: true }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
