import { defineCard } from "../define.js";


export default defineCard({
  name: "Night Terrors",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player reveals their hand. You choose a nonland card from it. Exile that card.",
  targets: ["player"],
  effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] }, destination: "exile" },
});
