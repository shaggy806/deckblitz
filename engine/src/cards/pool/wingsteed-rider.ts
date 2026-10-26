import { defineCard } from "../define.js";

// EDHREC rank 23089.

export default defineCard({
  name: "Wingsteed Rider",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nHeroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, put a +1/+1 counter on this creature.",
    },
  ],
});
