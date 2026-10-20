import { defineCard } from "../define.js";

export default defineCard({
  name: "Primeval Light",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy all enchantments target player controls.",
  targets: ["player"],
  effect: { kind: "destroy-all", filter: { type: "enchantment", controlledBy: "you" }, controlledByTarget: 0 },
});
