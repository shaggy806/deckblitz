import { defineCard } from "../define.js";

// EDHREC rank 30956.
//
// "While" is part of the trigger condition (Kirk, Commanding Officer's
// `whileCondition`): the total is read as Kirk is declared an attacker.

const ATTACK_TEXT =
  "Whenever Kirk attacks while creatures you control have total power 8 or greater, exile the top card of your " +
  "library. You may play that card this turn.";

export default defineCard({
  name: "Kirk, Enterprising Captain",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 4,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      whileCondition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "end-of-turn" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
