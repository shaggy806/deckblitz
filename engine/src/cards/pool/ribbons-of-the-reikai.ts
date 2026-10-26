import { defineCard } from "../define.js";

export default defineCard({
  name: "Ribbons of the Reikai",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Draw a card for each Spirit you control.",
  targets: [],
  effect: { kind: "draw", amount: { countOf: { subtype: "Spirit", controlledBy: "you" } } },
});
