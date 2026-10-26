import { defineCard } from "../define.js";

// EDHREC rank 22776.

export default defineCard({
  name: "Festival of Trokin",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each creature you control.",
  effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" }, times: 2 } },
});
