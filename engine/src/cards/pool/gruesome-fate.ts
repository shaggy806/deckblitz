import { defineCard } from "../define.js";

export default defineCard({
  name: "Gruesome Fate",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent loses 1 life for each creature you control.",
  targets: [],
  effect: { kind: "lose-life", who: "each-opponent", amount: { countOf: { type: "creature", controlledBy: "you" } } },
});
