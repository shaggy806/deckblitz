import { defineCard } from "../define.js";

// EDHREC rank 20619.

export default defineCard({
  name: "Cabal Conditioning",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Any number of target players each discard a number of cards equal to the greatest mana value among permanents you control.",
  targets: [{ kind: "any-number", of: "player" }],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: {
      kind: "discard",
      target: 0,
      amount: { aggregate: "max", of: "mana-value", filter: { controlledBy: "you" } },
    },
  },
});
