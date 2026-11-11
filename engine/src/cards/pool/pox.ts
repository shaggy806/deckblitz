import { defineCard } from "../define.js";

const third = <T,>(of: T) => ({ half: of, round: "up", fraction: 3 }) as const;

export default defineCard({
  name: "Pox",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each player loses a third of their life, then discards a third of the cards in their hand, then sacrifices a third of the creatures they control of their choice, then sacrifices a third of the lands they control of their choice. Round up each time.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "lose-life", who: "each-player", amount: third({ lifeTotal: "each" } as const) },
      { kind: "discard", target: "each-player", amount: third({ cardsInHand: "each" } as const) },
      {
        kind: "sacrifice",
        who: "each-player",
        filter: { type: "creature" },
        count: third({ countOf: { type: "creature", controlledBy: "you" }, forEachPlayer: true } as const),
      },
      {
        kind: "sacrifice",
        who: "each-player",
        filter: { type: "land" },
        count: third({ countOf: { type: "land", controlledBy: "you" }, forEachPlayer: true } as const),
      },
    ],
  },
});
