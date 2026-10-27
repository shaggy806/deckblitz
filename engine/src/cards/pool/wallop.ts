import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 31907.

export default defineCard({
  name: "Wallop",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target blue or black creature with flying.",
  targets: [
    {
      kind: "permanent",
      filter: { type: "creature", keyword: "flying", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
