import { defineCard } from "../define.js";

// EDHREC rank 30381.

export default defineCard({
  name: "Decompose",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile up to three target cards from a single graveyard.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any" },
      max: 3,
      sameController: true,
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: { kind: "exile", target: 0 },
  },
});
