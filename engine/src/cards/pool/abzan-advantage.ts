import { defineCard } from "../define.js";

// EDHREC rank 21173. Fate Reforged.

export default defineCard({
  name: "Abzan Advantage",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player sacrifices an enchantment of their choice. Bolster 1. (Choose a creature with the least toughness among creatures you control and put a +1/+1 counter on it.)",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "enchantment" }, count: 1 },
      { kind: "bolster", amount: 1 },
    ],
  },
});
