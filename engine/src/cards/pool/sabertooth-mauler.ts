import { defineCard } from "../define.js";

// Once per end step however many died, a death before it entered included
// (its rulings).
const TEXT =
  "At the beginning of your end step, if a creature died this turn, put a +1/+1 counter on this creature and untap it.";

export default defineCard({
  name: "Sabertooth Mauler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "untap", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
