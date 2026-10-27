import { defineCard } from "../define.js";

// EDHREC rank 31944.

export default defineCard({
  name: "Manacles of Decay",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack.\n{B}: Enchanted creature gets -1/-1 until end of turn.\n{R}: Enchanted creature can't block this turn.",
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, restrictions: ["cant-attack"], text: "Enchanted creature can't attack." }],
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "attached", power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: Enchanted creature gets -1/-1 until end of turn.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "restrict", target: "attached", restrictions: ["cant-block"] },
      resolve: null,
      text: "{R}: Enchanted creature can't block this turn.",
    },
  ],
});
