import { defineCard } from "../define.js";

const HEROIC_TEXT = "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on it.";

export default defineCard({
  name: "Lagonna-Band Trailblazer",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Centaur", "Scout"],
  power: 0,
  toughness: 4,
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
