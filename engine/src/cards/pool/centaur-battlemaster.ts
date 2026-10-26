import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put three +1/+1 counters on this creature.";

export default defineCard({
  name: "Centaur Battlemaster",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 3,
  toughness: 3,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 3 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
