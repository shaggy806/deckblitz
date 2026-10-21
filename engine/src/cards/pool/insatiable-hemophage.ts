import { defineCard } from "../define.js";

const TRIGGER_TEXT =
  "Whenever this creature mutates, each opponent loses X life and you gain X life, where X is the number of times this creature has mutated.";

export default defineCard({
  name: "Insatiable Hemophage",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  mutate: "{2}{B}",
  text: `Mutate {2}{B} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nDeathtouch\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { timesMutated: "source" }, who: "each-opponent" },
          { kind: "gain-life", amount: { timesMutated: "source" } },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
