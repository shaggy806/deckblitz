import { defineCard } from "../define.js";

export default defineCard({
  name: "Nullify",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target creature or Aura spell.",
  targets: [{ kind: "spell", filter: { anyOf: [{ type: "creature" }, { type: "enchantment", subtype: "Aura" }] } }],
  effect: { kind: "counter", target: 0 },
});
