import { defineCard } from "../define.js";

// Theros Beyond Death. An intervening-if (rule 603.4), checked as the combat
// step begins and again as it resolves — "another" keeps the Hornbeetle itself
// out of the count.

const TEXT =
  "At the beginning of combat on your turn, if you control another creature with power 4 or greater, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Nessian Hornbeetle",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "controls", filter: { type: "creature", power: { op: "gte", n: 4 } }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
