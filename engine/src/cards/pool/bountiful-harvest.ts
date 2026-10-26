import { defineCard } from "../define.js";

export default defineCard({
  name: "Bountiful Harvest",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain 1 life for each land you control.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { type: "land", controlledBy: "you" } } },
});
