import { defineCard } from "../define.js";

// EDHREC rank 19617.
const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Akroan Skyguard",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${HEROIC}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: HEROIC,
    },
  ],
});
