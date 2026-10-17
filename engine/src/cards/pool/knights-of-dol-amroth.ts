import { defineCard } from "../define.js";

// EDHREC rank 13450.

const TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Knights of Dol Amroth",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
