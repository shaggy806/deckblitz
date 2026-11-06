import { defineCard } from "../define.js";

/** "X is the number of differently named lands you control." */
const X = { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } } as const;

export default defineCard({
  name: "The Destruction of Praxis",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Strange new worlds — All creatures get -X/-X until end of turn, where X is the number of differently named lands you control. If X is 6 or more, create two 2/1 red Klingon Warrior creature tokens with haste.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "modify-pt-all",
        filter: { type: "creature" },
        power: { product: [X, -1] },
        toughness: { product: [X, -1] },
        duration: "end-of-turn",
      },
      {
        kind: "conditional",
        condition: { kind: "aggregate", value: X, compare: { op: "gte", n: 6 } },
        then: { kind: "create-token", token: "Klingon Warrior Token", count: 2 },
      },
    ],
  },
});
