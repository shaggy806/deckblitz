import { defineCard } from "../define.js";

// EDHREC rank 7278.

export default defineCard({
  name: "Glowstone Recluse",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  mutate: "{3}{G}",
  text: "Mutate {3}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nReach\nWhenever this creature mutates, put two +1/+1 counters on it.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
      resolve: null,
      text: "Whenever this creature mutates, put two +1/+1 counters on it.",
    },
  ],
});
