import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Pheres-Band Thunderhoof",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur", "Warrior"],
  power: 3,
  toughness: 4,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
