import { defineCard } from "../define.js";

const TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Erudite Wizard",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      // Counts every card drawn this turn, whether or not this creature was
      // around for the first (the ruling).
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
