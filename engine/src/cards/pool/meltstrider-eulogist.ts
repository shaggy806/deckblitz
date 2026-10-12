import { defineCard } from "../define.js";

// EDHREC rank 8012.
//
// Rulings:
//   [2025-07-25] If Meltstrider Eulogist dies at the same time as one or more creatures you
//     control with +1/+1 counters on them, its ability will trigger for each of those creatures.
//     This includes Meltstrider Eulogist itself if it had a +1/+1 counter on it when it died.
//
// A leaves-the-battlefield trigger looks back (rule 603.10a): the counters are
// the ones the creature died with, Eulogist's own included (Marchesa's shape).

const TEXT = "Whenever a creature you control with a +1/+1 counter on it dies, draw a card.";

export default defineCard({
  name: "Meltstrider Eulogist",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect", "Soldier"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
