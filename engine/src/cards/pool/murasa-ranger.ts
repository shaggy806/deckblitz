import { defineCard } from "../define.js";

// EDHREC rank 27153.

const TEXT =
  "Landfall — Whenever a land you control enters, you may pay {3}{G}. If you do, put two +1/+1 counters on this creature.";

export default defineCard({
  name: "Murasa Ranger",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ranger"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {3}{G} to put two +1/+1 counters on Murasa Ranger?",
        cost: "{3}{G}",
        effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
