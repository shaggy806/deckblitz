import { defineCard } from "../define.js";

// EDHREC rank 9475. March of the Machine.

export default defineCard({
  name: "Atraxa's Fall",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target artifact, battle, enchantment, or creature with flying.",
  targets: [
    {
      kind: "permanent",
      filter: {
        anyOf: [{ type: "artifact" }, { type: "battle" }, { type: "enchantment" }, { type: "creature", keyword: "flying" }],
      },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
