import { defineCard } from "../define.js";

export default defineCard({
  name: "Feast of Dreams",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target enchanted creature or enchantment creature.",
  targets: [
    { kind: "permanent", filter: { type: "creature", anyOf: [{ enchanted: true }, { type: "enchantment" }] } },
  ],
  effect: { kind: "destroy", target: 0 },
});
