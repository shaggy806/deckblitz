import { defineCard } from "../define.js";

// The creature it enchants as the ability resolves — or, the Aura gone, the
// one it enchanted before leaving, even if that's no longer a creature (its
// rulings): the `"attached"` reference.
export default defineCard({
  name: "Dreadful Apathy",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack or block.\n{2}{W}: Exile enchanted creature.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "exile", target: "attached" },
      resolve: null,
      text: "{2}{W}: Exile enchanted creature.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack", "cant-block"],
      text: "Enchanted creature can't attack or block.",
    },
  ],
});
