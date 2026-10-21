import { defineCard } from "../define.js";

export default defineCard({
  name: "Cubwarden",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 5,
  keywords: ["lifelink"],
  mutate: "{2}{W}{W}",
  text: "Mutate {2}{W}{W} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nLifelink\nWhenever this creature mutates, create two 1/1 white Cat creature tokens with lifelink.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lifelink Cat Token", count: 2 },
      resolve: null,
      text: "Whenever this creature mutates, create two 1/1 white Cat creature tokens with lifelink.",
    },
  ],
});
