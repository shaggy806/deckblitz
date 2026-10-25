import { defineCard } from "../define.js";

export default defineCard({
  name: "Hero of Leina Tower",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 1,
  toughness: 1,
  text: "Heroic — Whenever you cast a spell that targets this creature, you may pay {X}. If you do, put X +1/+1 counters on this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {X} to put X +1/+1 counters on Hero of Leina Tower?",
        cost: "{X}",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
      },
      resolve: null,
      text: "Heroic — Whenever you cast a spell that targets this creature, you may pay {X}. If you do, put X +1/+1 counters on this creature.",
    },
  ],
});
