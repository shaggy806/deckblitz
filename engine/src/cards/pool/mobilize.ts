import { defineCard } from "../define.js";

// Portal Second Age (P02). EDHREC rank 10937. Vitalize's shape.

export default defineCard({
  name: "Mobilize",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Untap all creatures you control.",
  targets: [],
  effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
});
