import { defineCard } from "../define.js";

// EDHREC rank 5320.
//
// Spree (rule 702.172a): one or more modes, each with its additional cost and
// its own target opponent, followed in printed order. Each half is read from
// the targeted opponent as its mode is done.

export default defineCard({
  name: "Rush of Dread",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Spree (Choose one or more additional costs.)\n" +
    "+ {1} — Target opponent sacrifices half the creatures they control of their choice, rounded up.\n" +
    "+ {2} — Target opponent discards half the cards in their hand, rounded up.\n" +
    "+ {2} — Target opponent loses half their life, rounded up.",
  castModal: {
    minModes: 1,
    maxModes: 3,
    modes: [
      {
        text: "+ {1} — Target opponent sacrifices half the creatures they control of their choice, rounded up.",
        spreeCost: "{1}",
        targets: ["opponent"],
        effect: {
          kind: "sacrifice",
          who: "target",
          filter: { type: "creature" },
          count: { half: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 }, round: "up" },
        },
      },
      {
        text: "+ {2} — Target opponent discards half the cards in their hand, rounded up.",
        spreeCost: "{2}",
        targets: ["opponent"],
        effect: { kind: "discard", target: 0, amount: { half: { cardsInHand: { target: 0 } }, round: "up" } },
      },
      {
        text: "+ {2} — Target opponent loses half their life, rounded up.",
        spreeCost: "{2}",
        targets: ["opponent"],
        effect: { kind: "lose-life", target: 0, amount: { half: { lifeTotal: "each" }, round: "up" } },
      },
    ],
  },
});
