import { defineCard } from "../define.js";

// The Brothers' War.
const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Lat-Nam Adept",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 3,
  text: DRAW_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
