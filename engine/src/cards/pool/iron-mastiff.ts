import { defineCard } from "../define.js";

const TEXT =
  "Whenever this creature attacks, roll a d20 for each player being attacked and ignore all but the highest roll.\n" +
  "1—9 | This creature deals damage equal to its power to you.\n" +
  "10—19 | This creature deals damage equal to its power to defending player.\n" +
  "20 | This creature deals damage equal to its power to each opponent.";

const POWER = { powerOf: "source" } as const;

export default defineCard({
  name: "Iron Mastiff",
  manaCost: "{4}",
  types: ["artifact", "creature"],
  subtypes: ["Dog"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "roll-dice",
        sides: 20,
        count: { opponentsAttacked: true },
        keepHighest: 1,
        table: [
          { min: 1, max: 9, effect: { kind: "damage", amount: POWER, who: "you" } },
          { min: 10, max: 19, effect: { kind: "damage", amount: POWER, who: "trigger-player" } },
          { min: 20, effect: { kind: "damage", amount: POWER, who: "each-opponent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
