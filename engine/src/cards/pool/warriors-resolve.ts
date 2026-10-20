import { defineCard } from "../define.js";
import { training } from "../helpers.js";

// EDHREC rank 13977.
//
// "Creatures you control have training" grants the training ability; a
// creature with its own training has two, each triggering (rule 702.149b).
// The end step's intervening-if reads the creatures there now: one with a
// +1/+1 counter that attacked this turn, whenever the counter came (the
// ruling).

const GRANT_TEXT =
  "Creatures you control have training. (Whenever a creature you control attacks with another creature with greater power, put a +1/+1 counter on the creature with lesser power.)";
const END_TEXT =
  "At the beginning of your end step, if you control a creature with a +1/+1 counter on it that attacked this turn, draw a card.";

export default defineCard({
  name: "Warrior's Resolve",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${GRANT_TEXT}\n${END_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsTriggered: [training()],
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "controls",
        filter: {
          type: "creature",
          counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } },
          attackedThisTurn: true,
        },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
