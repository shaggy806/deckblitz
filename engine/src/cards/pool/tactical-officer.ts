import { defineCard } from "../define.js";

// EDHREC rank 29218.

const TEXT =
  "Whenever you attack while creatures you control have total power 8 or greater, put a +1/+1 counter on this creature. Untap it.";

// "While …" is part of the trigger condition, read as the attack is declared
// (`whileCondition`): every creature you control counts, attacking or not.
export default defineCard({
  name: "Tactical Officer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Officer"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      whileCondition: {
        kind: "aggregate",
        value: { aggregate: "sum", of: "power", filter: { type: "creature", controlledBy: "you" } },
        compare: { op: "gte", n: 8 },
      },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "untap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
