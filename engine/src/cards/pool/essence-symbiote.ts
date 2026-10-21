import { defineCard } from "../define.js";

const TEXT = "Whenever a creature you control mutates, put a +1/+1 counter on that creature and you gain 2 life.";

// The mutated permanent is the trigger object. The life is gained even if
// the counter can't be put on it (it left the battlefield — the ruling).
export default defineCard({
  name: "Essence Symbiote",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "mutates", who: "you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
