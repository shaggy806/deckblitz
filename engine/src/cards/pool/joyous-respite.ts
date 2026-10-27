import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 23117. Bountiful Harvest's shape.

export default defineCard({
  name: "Joyous Respite",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "You gain 1 life for each land you control.",
  targets: [],
  effect: { kind: "gain-life", amount: { countOf: { type: "land", controlledBy: "you" } } },
});
