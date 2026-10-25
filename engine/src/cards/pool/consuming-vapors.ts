import { defineCard } from "../define.js";

// The life is the sacrificed creature's toughness as it last existed on the
// battlefield; none sacrificed, no life (the rulings) — Entrapment Maneuver's
// `thisWay: "sacrificed"` sum.
export default defineCard({
  name: "Consuming Vapors",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Target player sacrifices a creature of their choice. You gain life equal to that creature's toughness.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  rebound: true,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "gain-life", amount: { thisWay: "sacrificed", sumOf: "toughness" } },
    ],
  },
});
