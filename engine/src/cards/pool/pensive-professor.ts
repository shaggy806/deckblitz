import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// EDHREC rank 5527. Secrets of Strixhaven. "One or more +1/+1 counters are
// put on this creature" fires once per placement (rule 122.6), increment's
// own counter included.

const INCREMENT = increment();
const DRAW_TEXT = "Whenever one or more +1/+1 counters are put on this creature, draw a card.";

export default defineCard({
  name: "Pensive Professor",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  text: `${INCREMENT.text}\n${DRAW_TEXT}`,
  triggered: [
    INCREMENT,
    {
      trigger: { on: "counters-put", who: "self", counter: "+1/+1" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
