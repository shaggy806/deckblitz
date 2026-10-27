import { defineCard } from "../define.js";

const TEXT =
  "Whenever you cast a creature spell with mana value 6 or greater, put three +1/+1 counters on this creature.";

export default defineCard({
  name: "Kurgadon",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", manaValue: { op: "gte", n: 6 } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      resolve: null,
      text: TEXT,
    },
  ],
});
