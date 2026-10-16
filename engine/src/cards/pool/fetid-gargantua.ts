import { defineCard } from "../define.js";

// EDHREC rank 15519.
//
// Adapt (rule 701.46) asks as it resolves: with any +1/+1 counter by then it
// puts none, and one that has lost them all can adapt again (the rulings).
// "One or more" counters is one trigger per batch; the draw is optional and
// the life loss only follows it ("If you do").
const ADAPT_TEXT = "{2}{B}: Adapt 2. (If this creature has no +1/+1 counters on it, put two +1/+1 counters on it.)";
const DRAW_TEXT =
  "Whenever one or more +1/+1 counters are put on this creature, you may draw two cards. If you do, you lose 2 life.";

export default defineCard({
  name: "Fetid Gargantua",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 4,
  toughness: 4,
  text: `${ADAPT_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "eq", n: 0 } },
        then: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      },
      resolve: null,
      text: ADAPT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw two cards? If you do, you lose 2 life.",
        effect: { kind: "draw", amount: 2 },
        then: { kind: "lose-life", amount: 2, who: "you" },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
