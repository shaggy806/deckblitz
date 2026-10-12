import { defineCard } from "../define.js";

export default defineCard({
  name: "Fragmentize",
  manaCost: "{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Destroy target artifact or enchantment with mana value 4 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "lte", n: 4 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
