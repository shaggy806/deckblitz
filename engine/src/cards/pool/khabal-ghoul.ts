import { defineCard } from "../define.js";

// EDHREC rank 27441.
//
// Rulings:
//   Counts all creatures put into all graveyards from the battlefield this turn, tokens and
//   creatures that died before Khabál Ghoul entered included.

const TEXT = "At the beginning of each end step, put a +1/+1 counter on this creature for each creature that died this turn.";

export default defineCard({
  name: "Khabál Ghoul",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter",
        target: "source",
        counter: "+1/+1",
        amount: { creaturesDiedThisTurn: true, anyController: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
