import { defineCard } from "../define.js";

// EDHREC rank 18239. Argentum Masticore's protection, on the enchanted
// creature. The Aura is white, so the protection never makes it fall off.
//
// Rulings:
//   [2013-01-24] Hybrid spells and permanents in the Return to Ravnica block are multicolored,
//     even if you cast them with one color of mana.
//   [2013-01-24] The enchanted creature can’t be enchanted or equipped by multicolored Auras and
//     Equipment, it can’t be blocked by multicolored creatures, it can’t be targeted by
//     multicolored spells or abilities from multicolored sources, and all damage dealt to it by
//     multicolored sources is prevented.

export default defineCard({
  name: "Guildscorn Ward",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has protection from multicolored.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      protection: { filter: { multicolored: true } },
      text: "Enchanted creature has protection from multicolored.",
    },
  ],
});
