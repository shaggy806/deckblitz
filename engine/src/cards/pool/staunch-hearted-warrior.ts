import { defineCard } from "../define.js";

const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Staunch-Hearted Warrior",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: HEROIC,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: HEROIC,
    },
  ],
});
