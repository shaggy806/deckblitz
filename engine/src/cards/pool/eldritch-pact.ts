import { defineCard } from "../define.js";

// X is the number of cards in the target player's graveyard as the spell
// resolves. The life loss is applied before the draws so that both read the
// same X: a draw can put cards into a graveyard (dredge replaces it with a
// mill), losing life can't, and nothing observable depends on the order of
// the two within one resolution.
export default defineCard({
  name: "Eldritch Pact",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player draws X cards and loses X life, where X is the number of cards in their graveyard.",
  targets: ["player"],
  effect: {
    kind: "for-each-target",
    from: 0,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "lose-life", target: 0, amount: { graveyardSize: "each" } },
        { kind: "draw", target: 0, amount: { graveyardSize: "each" } },
      ],
    },
  },
});
