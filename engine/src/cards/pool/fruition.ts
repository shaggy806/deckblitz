import { defineCard } from "../define.js";

// EDHREC rank 22721. Every Forest on the battlefield, whoever controls it.

export default defineCard({
  name: "Fruition",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain 1 life for each Forest on the battlefield.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { subtype: "Forest" } } },
});
