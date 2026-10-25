import { defineCard } from "../define.js";

// EDHREC rank 26904.

export default defineCard({
  name: "Landbind Ritual",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "You gain 2 life for each Plains you control.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { subtype: "Plains", controlledBy: "you" }, times: 2 } },
});
