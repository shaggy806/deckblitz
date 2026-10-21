import { defineCard } from "../define.js";

export default defineCard({
  name: "Migratory Greathorn",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 4,
  mutate: "{2}{G}",
  text: "Mutate {2}{G} (If you cast this spell for its mutate cost, put it over or under target non-Human creature you own. They mutate into the creature on top plus all abilities from under it.)\nWhenever this creature mutates, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
  triggered: [
    {
      trigger: { on: "mutates", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      resolve: null,
      text: "Whenever this creature mutates, search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    },
  ],
});
