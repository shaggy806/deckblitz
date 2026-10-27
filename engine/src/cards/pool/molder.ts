import { defineCard } from "../define.js";

export default defineCard({
  name: "Molder",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Destroy target artifact or enchantment with mana value X. It can't be regenerated. You gain X life.",
  targets: [
    { kind: "permanent", filter: { typesAnyOf: ["artifact", "enchantment"], manaValue: { op: "eq", n: "x" } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0, cantBeRegenerated: true },
      { kind: "gain-life", amount: "x" },
    ],
  },
});
