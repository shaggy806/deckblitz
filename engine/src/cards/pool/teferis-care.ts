import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 27981.
export default defineCard({
  name: "Teferi's Care",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "{W}, Sacrifice an enchantment: Destroy target enchantment.\n{3}{U}{U}: Counter target enchantment spell.",
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: { filter: { type: "enchantment" } } },
      targets: ["enchantment"],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: "{W}, Sacrifice an enchantment: Destroy target enchantment.",
    },
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [{ kind: "spell", filter: { type: "enchantment" } }],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{3}{U}{U}: Counter target enchantment spell.",
    },
  ],
});
