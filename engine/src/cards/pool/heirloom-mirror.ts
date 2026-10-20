import { defineCard } from "../define.js";

const TEXT =
  "{1}, {T}, Pay 1 life, Discard a card: Draw a card, mill a card, then put a ritual counter on this artifact. Then if it has three or more ritual counters on it, remove them and transform it. Activate only as a sorcery.";

export default defineCard({
  name: "Heirloom Mirror",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, payLife: 1, discard: { count: 1 } },
      sorcerySpeed: true,
      targets: [],
      // Strixhaven Stadium's count-then-remove shape. It stays tapped as it
      // transforms (its ruling).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          { kind: "mill", target: "you", amount: 1 },
          { kind: "add-counter", target: "source", counter: "ritual", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "ritual", compare: { op: "gte", n: 3 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "remove-counter",
                  target: "source",
                  counter: "ritual",
                  amount: { countersOn: "source", counter: "ritual" },
                },
                { kind: "transform", target: "source" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Heirloom Mirror", "Inherited Fiend"],
  transform: true,
});
