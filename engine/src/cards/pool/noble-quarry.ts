import { defineCard } from "../define.js";

// EDHREC rank 15608. "This creature or enchanted creature": Lure's
// requirement on itself while it's a creature (Breaker of Armies) and on what
// it enchants while bestowed (Lure).
const LURE_TEXT = "All creatures able to block this creature or enchanted creature do so.";

export default defineCard({
  name: "Noble Quarry",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Unicorn"],
  power: 1,
  toughness: 1,
  bestow: "{5}{G}",
  text: `Bestow {5}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\n${LURE_TEXT}\nEnchanted creature gets +1/+1.`,
  static: [
    { affects: { scope: "self" }, restrictions: ["must-be-blocked"], text: LURE_TEXT },
    { affects: { scope: "attached" }, restrictions: ["must-be-blocked"], text: LURE_TEXT },
    { affects: { scope: "attached" }, grantPt: [1, 1], text: "Enchanted creature gets +1/+1." },
  ],
});
