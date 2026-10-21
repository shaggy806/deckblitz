import { defineCard } from "../define.js";

// EDHREC rank 18707.
//
// "Your life total becomes N" is gaining or losing the difference (rule
// 119.5), so life-gain and life-loss effects apply (the rulings): a gain of
// the difference when the toughness total is higher, a loss when it's lower,
// nothing when they're equal. X for the pump is read as it resolves.
//
// Rulings:
//   [2019-07-12] For your life total to become a certain number, you gain or lose the
//     corresponding amount of life. For example, if your life total is 4 when the ability resolves
//     and your creatures have a total of 6 toughness, the ability will cause you to gain 2 life;
//     alternatively, if your life total is 10 when the ability resolves, it will cause you to lose
//     4 life if you choose to change your life total.

const ENTER_TEXT =
  "When this creature enters, you may have your life total become the total toughness of creatures you control.";
const PUMP_TEXT = "{5}{W}: This creature gets +X/+X until end of turn, where X is your life total.";
const TOUGHNESS = { aggregate: "sum", of: "toughness", filter: { type: "creature", controlledBy: "you" } } as const;
const LIFE = { lifeTotal: "you" } as const;

export default defineCard({
  name: "Loxodon Lifechanter",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 4,
  toughness: 6,
  text: `${ENTER_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have your life total become the total toughness of creatures you control?",
        effect: {
          kind: "conditional",
          condition: { kind: "aggregate", value: TOUGHNESS, compare: { op: "gt", n: { amount: LIFE } } },
          then: { kind: "gain-life", amount: { difference: [TOUGHNESS, LIFE] } },
          else: {
            kind: "conditional",
            condition: { kind: "aggregate", value: TOUGHNESS, compare: { op: "lt", n: { amount: LIFE } } },
            then: { kind: "lose-life", amount: { difference: [LIFE, TOUGHNESS] } },
          },
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: LIFE, toughness: LIFE, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
