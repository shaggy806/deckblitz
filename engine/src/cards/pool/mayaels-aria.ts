import { defineCard } from "../define.js";

// EDHREC rank 7111.
//
// Rulings:
//   [2009-05-01] The three parts of the ability happen sequentially. For example, if you control a
//     creature with 9 power when the ability starts to resolve, you'll put a +1/+1 counter on each
//     creature you control — and now, since you control a creature with 10 power, you'll gain 10
//     life.
//   [2009-05-01] This ability triggers at the beginning of each of your upkeeps. Whether you
//     control any applicable creatures is checked only when the ability resolves.
//
// Three `conditional`s in a `sequence`, each asked as its own step comes up
// (the first ruling) — none of them an intervening-if (the second).
const TEXT =
  "At the beginning of your upkeep, put a +1/+1 counter on each creature you control if you control a creature with power 5 or greater. Then you gain 10 life if you control a creature with power 10 or greater. Then you win the game if you control a creature with power 20 or greater.";

const controlsPower = (n: number) =>
  ({
    kind: "controls",
    filter: { type: "creature", power: { op: "gte", n } },
    atLeast: 1,
  }) as const;

export default defineCard({
  name: "Mayael's Aria",
  manaCost: "{R}{G}{W}",
  colors: ["W", "R", "G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "conditional",
            condition: controlsPower(5),
            then: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
          },
          { kind: "conditional", condition: controlsPower(10), then: { kind: "gain-life", amount: 10 } },
          { kind: "conditional", condition: controlsPower(20), then: { kind: "win-game" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
