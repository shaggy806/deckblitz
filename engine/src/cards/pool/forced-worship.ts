import { defineCard } from "../define.js";

// EDHREC rank 23604.
export default defineCard({
  name: "Forced Worship",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature can't attack.\n{2}{W}: Return this Aura to its owner's hand.",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["cant-attack"],
      text: "Enchanted creature can't attack.",
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "{2}{W}: Return this Aura to its owner's hand.",
    },
  ],
});
