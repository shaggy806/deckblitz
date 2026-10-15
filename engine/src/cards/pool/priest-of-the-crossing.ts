import { defineCard } from "../define.js";

// EDHREC rank 10347.

const END_TEXT =
  "At the beginning of each end step, put X +1/+1 counters on each creature you control, where X is the number of creatures that died under your control this turn.";

export default defineCard({
  name: "Priest of the Crossing",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Zombie", "Bird", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: { creaturesDiedThisTurn: true },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
