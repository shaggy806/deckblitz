import { defineCard } from "../define.js";

export default defineCard({
  name: "Natural State",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment with mana value 3 or less.",
  targets: [
    {
      kind: "permanent",
      filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "lte", n: 3 } },
    },
  ],
  effect: { kind: "destroy", target: 0 },
});
