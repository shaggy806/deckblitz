import { defineCard } from "../define.js";


export default defineCard({
  name: "Desecrated Earth",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target land. Its controller discards a card.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "discard", target: { controllerOf: 0 }, amount: 1 },
    ],
  },
});
