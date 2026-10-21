import { defineCard } from "../define.js";

export default defineCard({
  name: "Trumpeting Gnarr",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 3,
  mutate: "{3}{G/U}{G/U}",
  text: "Mutate {3}{G/U}{G/U} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, create a 3/3 green Beast creature token.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Beast Token", count: 1 },
      resolve: null,
      text: "Whenever this creature mutates, create a 3/3 green Beast creature token.",
    },
  ],
});
