import { defineCard } from "../define.js";

// The graveyard is read as the discard comes, after the draw (rule 608.2c).
export default defineCard({
  name: "Tainted Indulgence",
  manaCost: "{U}{B}",
  colors: ["U", "B"],
  types: ["instant"],
  text: "Draw two cards. Then discard a card unless there are five or more mana values among cards in your graveyard.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2 },
      {
        kind: "conditional",
        condition: {
          kind: "not",
          of: {
            kind: "aggregate",
            value: { aggregate: "distinct", of: "mana-value", filter: { ownedBy: "you" }, in: "graveyards" },
            compare: { op: "gte", n: 5 },
          },
        },
        then: { kind: "discard", target: "you", amount: 1 },
      },
    ],
  },
});
