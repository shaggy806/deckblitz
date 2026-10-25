import { defineCard } from "../define.js";

// EDHREC rank 23903.

const TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Setessan Oathsworn",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Satyr", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
