import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const TEXT =
  "At the beginning of your end step, put a time counter on Kes, then draw X cards, where X is the number of time counters on her. Then if she has nine or more time counters on her, sacrifice her.";

export default defineCard({
  name: "Kes, Evolving Telepath",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Ocampa", "Advisor"],
  power: 2,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "time", amount: 1 },
          { kind: "draw", amount: { countersOn: "source", counter: "time" } },
          {
            kind: "conditional",
            condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 9 } },
            then: { kind: "sacrifice-source" },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
