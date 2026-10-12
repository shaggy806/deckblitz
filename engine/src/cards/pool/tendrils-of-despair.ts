import { defineCard } from "../define.js";

export default defineCard({
  name: "Tendrils of Despair",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nTarget opponent discards two cards.",
  targets: ["opponent"],
  effect: { kind: "discard", target: 0, amount: 2 },
});
