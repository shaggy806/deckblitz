import { defineCard } from "../define.js";

// EDHREC rank 26517. Fifth Dawn.

export default defineCard({
  name: "Fangren Pathcutter",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 4,
  toughness: 6,
  text: "Whenever this creature attacks, attacking creatures gain trample until end of turn.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", attacking: true },
        keyword: "trample",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Whenever this creature attacks, attacking creatures gain trample until end of turn.",
    },
  ],
});
