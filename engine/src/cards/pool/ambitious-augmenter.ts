import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

// Secrets of Strixhaven. The dies trigger's "if it had one or more counters
// on it" is an intervening if over the creature as it last existed (rules
// 603.4, 603.10a). Its counters — every kind, as it last existed (608.2h) —
// go on the Fractal it just made; should a replacement make more than one,
// each gets them (`separate`, one object each).
const INCREMENT = increment();
const DIES =
  "When this creature dies, if it had one or more counters on it, create a 0/0 green and blue Fractal creature token, then put this creature's counters on that token.";

export default defineCard({
  name: "Ambitious Augmenter",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Turtle", "Wizard"],
  power: 1,
  toughness: 1,
  text: `${INCREMENT.text}\n${DIES}`,
  triggered: [
    INCREMENT,
    {
      trigger: { on: "dies", who: "self" },
      condition: { kind: "self-counters", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Fractal Token", count: 1, separate: true },
          { kind: "put-counters-of", of: "source", target: "created" },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
