import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const GRANTED = "Whenever this creature attacks, each opponent loses 1 life and you gain 1 life.";
const TEXT = `Artifact creatures you control have "${GRANTED}"`;

export default defineCard({
  name: "Bio-Asset Allocator",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { types: ["artifact", "creature"], controlledBy: "you" } },
      grantsTriggered: [
        {
          trigger: { on: "attacks", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "lose-life", amount: 1, who: "each-opponent" },
              { kind: "gain-life", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
