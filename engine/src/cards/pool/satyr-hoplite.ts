import { defineCard } from "../define.js";

const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Satyr Hoplite",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Satyr", "Soldier"],
  power: 1,
  toughness: 1,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
