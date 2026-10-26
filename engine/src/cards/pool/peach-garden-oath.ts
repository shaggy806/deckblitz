import { defineCard } from "../define.js";

// EDHREC rank 21207.

export default defineCard({
  name: "Peach Garden Oath",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each creature you control.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2 } },
});
