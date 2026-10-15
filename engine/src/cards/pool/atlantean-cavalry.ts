import { defineCard } from "../define.js";

// EDHREC rank 19924.
const DRAW_TEXT = "Whenever you draw your second card each turn, put a +1/+1 counter on this creature.";

export default defineCard({
  name: "Atlantean Cavalry",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${DRAW_TEXT}`,
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
