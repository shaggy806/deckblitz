import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 21993.

export default defineCard({
  name: "Phyrexian Tribute",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice two creatures.\nDestroy target artifact.",
  targets: ["artifact"],
  effect: { kind: "destroy", target: 0 },
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" }, sacrificeCount: 2 },
});
