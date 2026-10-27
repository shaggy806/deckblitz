import { defineCard } from "../define.js";

export default defineCard({
  name: "Mind Sludge",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card for each Swamp you control.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: { countOf: { subtype: "Swamp", controlledBy: "you" } } },
});
