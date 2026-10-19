import { defineCard } from "../define.js";

const DIES_TEXT = "Weird Insight — When this creature dies, roll a d20.";
const TABLE_TEXT =
  "1—9 | You draw a card and you lose 1 life.\n" +
  "10—19 | You draw two cards and you lose 2 life.\n" +
  "20 | You draw seven cards and you lose 7 life.";

const drawAndLose = (n: number) =>
  ({
    kind: "sequence",
    effects: [
      { kind: "draw", amount: n },
      { kind: "lose-life", amount: n },
    ],
  }) as const;

export default defineCard({
  name: "Nothic",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 3,
  text: `${DIES_TEXT}\n${TABLE_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        table: [
          { min: 1, max: 9, effect: drawAndLose(1) },
          { min: 10, max: 19, effect: drawAndLose(2) },
          { min: 20, effect: drawAndLose(7) },
        ],
      },
      resolve: null,
      text: `${DIES_TEXT}\n${TABLE_TEXT}`,
    },
  ],
});
