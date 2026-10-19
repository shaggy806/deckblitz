import { defineCard } from "../define.js";

// The Brothers' War. Broken Wings' target, exiled.
export default defineCard({
  name: "Shoot Down",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Exile target artifact, enchantment, or creature with flying.",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: { kind: "exile", target: 0 },
});
