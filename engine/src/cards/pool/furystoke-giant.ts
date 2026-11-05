import { defineCard } from "../define.js";

// EDHREC rank 17030. The creatures gaining the ability are fixed as it
// resolves (rule 611.2c); the Giant itself isn't one of them.
const GRANTED = "{T}: This creature deals 2 damage to any target.";
const ETB_TEXT = `When this creature enters, other creatures you control gain "${GRANTED.slice(0, -1)}" until end of turn.`;
const PERSIST_TEXT =
  "Persist (When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner's control with a -1/-1 counter on it.)";

export default defineCard({
  name: "Furystoke Giant",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${PERSIST_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        exceptSource: true,
        simultaneous: true,
        effect: {
          kind: "grant-activated",
          target: 0,
          ability: {
            cost: { mana: null, tap: true },
            targets: ["any-target"],
            effect: { kind: "damage", amount: 2, target: 0 },
            resolve: null,
            text: GRANTED,
          },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", counter: "-1/-1", compare: { op: "eq", n: 0 } },
      targets: [],
      effect: {
        kind: "put-onto-battlefield",
        target: "trigger-object",
        withCounters: { kind: "-1/-1", amount: 1 },
      },
      resolve: null,
      text: PERSIST_TEXT,
    },
  ],
});
