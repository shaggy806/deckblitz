import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Dawnbringer Charioteers",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${HEROIC_TEXT}`,
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
