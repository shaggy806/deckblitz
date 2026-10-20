import { defineCard } from "../define.js";

// "Target player controls": the filter read from their side
// (`controlledByTarget`), each permanent going to its owner's hand at once.
export default defineCard({
  name: "River's Rebuke",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Return all nonland permanents target player controls to their owner's hand.",
  targets: ["player"],
  effect: { kind: "return-to-hand-all", filter: { notTypes: ["land"], controlledBy: "you" }, controlledByTarget: 0 },
});
