import { defineCard } from "../define.js";

// EDHREC rank 23871.

const TEXT =
  "Whenever Mabel or another creature you control enters, put a +1/+1 counter on target creature that entered this turn.";

// "Mabel or another creature you control": the enters trigger without
// `otherOnly`, so Mabel's own entry fires it. The target is any creature
// that entered this turn, whoever controls it.
export default defineCard({
  name: "Mabel, Valley Hero",
  manaCost: "{1}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mouse", "Soldier"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" } },
      targets: [{ kind: "permanent", filter: { type: "creature", enteredThisTurn: true } }],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
