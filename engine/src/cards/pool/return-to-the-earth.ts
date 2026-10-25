import { defineCard } from "../define.js";

export default defineCard({
  name: "Return to the Earth",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact, enchantment, or creature with flying.",
  targets: [
    {
      kind: "permanent",
      filter: { anyOf: [{ type: "artifact" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }] },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
