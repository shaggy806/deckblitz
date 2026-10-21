import { defineCard } from "../define.js";

const TRIGGER_TEXT = "Whenever this creature mutates, put a +1/+1 counter on it.";

export default defineCard({
  name: "Vulpikeet",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Bird"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  mutate: "{2}{W}",
  text: `Mutate {2}{W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nFlying\n${TRIGGER_TEXT}`,
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
