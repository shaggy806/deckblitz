import { defineCard } from "../define.js";

// EDHREC rank 9901.
//
// Each half is read from each player's own side as that step is done, the
// permanents counting every one a player controls (lands included).

export default defineCard({
  name: "Pox Plague",
  manaCost: "{B}{B}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses half their life, then discards half the cards in their hand, then sacrifices half the permanents they control of their choice. Round down each time.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", who: "each-player", amount: { half: { lifeTotal: "each" }, round: "down" } },
      { kind: "discard", target: "each-player", amount: { half: { cardsInHand: "each" }, round: "down" } },
      {
        kind: "sacrifice",
        who: "each-player",
        filter: {},
        count: { half: { countOf: { controlledBy: "you" }, forEachPlayer: true }, round: "down" },
      },
    ],
  },
});
