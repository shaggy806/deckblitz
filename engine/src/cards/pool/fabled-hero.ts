import { defineCard } from "../define.js";

const HEROIC = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on it.";

export default defineCard({
  name: "Fabled Hero",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${HEROIC}`,
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
