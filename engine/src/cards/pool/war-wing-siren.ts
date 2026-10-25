import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "War-Wing Siren",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Soldier"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${HEROIC_TEXT}`,
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
