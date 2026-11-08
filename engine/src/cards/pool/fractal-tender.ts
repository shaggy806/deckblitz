import { defineCard } from "../define.js";
import { increment } from "../helpers.js";

const INCREMENT = increment();
const END_TEXT =
  "At the beginning of each end step, if you put a counter on this creature this turn, create a 0/0 green and blue Fractal creature token and put three +1/+1 counters on it.";

export default defineCard({
  name: "Fractal Tender",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 3,
  toughness: 3,
  text: `Ward {2}\n${INCREMENT.text}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", byOpponentOnly: true },
      targets: [],
      effect: { kind: "ward", cost: { mana: "{2}" } },
      resolve: null,
      text: "Ward {2}",
    },
    INCREMENT,
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      // Any kind of counter you put on it, in the stint it's in now (the journal's).
      condition: { kind: "source", filter: { journaled: { what: "counters-put", by: "you" } } },
      targets: [],
      effect: { kind: "create-token", token: "Fractal Token", count: 1, thenCounters: { kind: "+1/+1", amount: 3 } },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
