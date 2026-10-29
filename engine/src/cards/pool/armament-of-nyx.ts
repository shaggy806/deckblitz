import { defineCard } from "../define.js";
import type { StaticCondition } from "../define.js";

// EDHREC rank 22627.
// Rulings:
//   [2014-04-26] Armament of Nyx continuously checks to see whether the creature it's enchanting
//     is an enchantment or not. If the creature isn't an enchantment and becomes one, or it is an
//     enchantment and stops being one, the effect will change.
//
// Two statics on one condition, read continuously: double strike while the
// host is an enchantment, Muzzle's prevention while it isn't.

const HOST_IS_ENCHANTMENT: StaticCondition = { kind: "source", filter: { attachedTo: { type: "enchantment" } } };

export default defineCard({
  name: "Armament of Nyx",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has double strike as long as it's an enchantment. Otherwise, prevent all damage that would be dealt by enchanted creature. (A creature with double strike deals both first-strike and regular combat damage.)",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      condition: HOST_IS_ENCHANTMENT,
      grantKeywords: ["double-strike"],
      text: "Enchanted creature has double strike as long as it's an enchantment.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: HOST_IS_ENCHANTMENT },
      replacement: { event: "would-deal-damage", fromAttached: true, prevent: true },
      text: "Otherwise, prevent all damage that would be dealt by enchanted creature.",
    },
  ],
});
