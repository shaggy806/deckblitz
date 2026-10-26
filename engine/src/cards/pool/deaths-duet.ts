import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 24058. Dutiful Return without "up to": two targets, both required.

export default defineCard({
  name: "Death's Duet",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return two target creature cards from your graveyard to your hand.",
  targets: distinctTargets(2, { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }),
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "return-to-hand", target: 0, from: "graveyard" },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
