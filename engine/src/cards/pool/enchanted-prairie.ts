import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2): an enchantment land, no Aura.
export default defineCard({
  name: "Enchanted Prairie",
  colors: [],
  types: ["enchantment", "land"],
  text: "Enchanted Prairie enters tapped.\n{T}: Add {W} or {U}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["W", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {W} or {U}.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "Enchanted Prairie enters tapped.",
    },
  ],
});
