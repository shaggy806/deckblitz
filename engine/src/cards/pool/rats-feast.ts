import { defineCard } from "../define.js";

// EDHREC rank 28106.

export default defineCard({
  name: "Rats' Feast",
  manaCost: "{X}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Exile X target cards from a single graveyard.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any" },
      min: "x",
      max: "x",
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
