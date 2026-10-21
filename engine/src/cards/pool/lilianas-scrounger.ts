import { defineCard } from "../define.js";

// Once per end step however many died (an intervening-if over the turn, a
// death before the Scrounger arrived included). Which Liliana gets the
// counter is chosen as it resolves (its ruling), and "you may" is choosing
// none.

const TEXT =
  "At the beginning of each end step, if a creature died this turn, you may put a loyalty counter on a Liliana planeswalker you control.";

export default defineCard({
  name: "Liliana's Scrounger",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "creature-died-this-turn" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "planeswalker", subtype: "Liliana", controlledBy: "you" },
        min: 0,
        upTo: 1,
        then: { kind: "add-counter", target: 0, counter: "loyalty", amount: 1 },
        prompt: "Put a loyalty counter on a Liliana planeswalker you control?",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
