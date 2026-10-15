import { defineCard } from "../define.js";

// EDHREC rank 19058.
//
// Rulings:
//   [2026-06-29] Nasty Little Rabbit's ability will check at the start of your beginning of combat
//     step to see if you control a creature with power 4 or greater. If you don't, the ability
//     won't trigger at all. If it does trigger, the ability will check again as it tries to
//     resolve. If you don't control a creature with power 4 or greater at that time, the ability
//     won't resolve.
//
// An intervening "if" (rule 603.4): `condition`, asked on the trigger and again
// as it resolves — the ruling.

const TEXT =
  "Ferocious — At the beginning of combat on your turn, if you control a creature with power 4 or greater, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Nasty Little Rabbit",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rabbit"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
