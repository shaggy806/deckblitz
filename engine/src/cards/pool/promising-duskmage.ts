import { defineCard } from "../define.js";

// EDHREC rank 28460.

const DIES_TEXT = "When this creature dies, if it had a +1/+1 counter on it, draw a card.";

export default defineCard({
  name: "Promising Duskmage",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 2,
  toughness: 3,
  text: DIES_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      // Read off the creature as it last existed on the battlefield.
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
