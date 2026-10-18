import { defineCard } from "../define.js";

// EDHREC rank 24646.

const TEXT =
  "When this creature enters, you gain 3 life. Then if you control a permanent with an oil counter on it, draw a card.";

export default defineCard({
  name: "Oil-Gorger Troll",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Troll", "Warrior"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          {
            kind: "conditional",
            condition: { kind: "controls", filter: { counters: { kind: "oil", compare: { op: "gte", n: 1 } } }, atLeast: 1 },
            then: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
