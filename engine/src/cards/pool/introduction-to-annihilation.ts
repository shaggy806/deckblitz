import { defineCard } from "../define.js";


export default defineCard({
  name: "Introduction to Annihilation",
  manaCost: "{5}",
  colors: [],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Exile target nonland permanent. Its controller draws a card.",
  targets: ["nonland-permanent"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "exile", target: 0 }, { kind: "draw", who: { controllerOf: 0 }, amount: 1 }],
  },
});
