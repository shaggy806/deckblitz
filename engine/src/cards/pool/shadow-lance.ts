import { defineCard } from "../define.js";

// EDHREC rank 28966.
export default defineCard({
  name: "Shadow Lance",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has first strike.\n{1}{B}: Enchanted creature gets +2/+2 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}{B}: Enchanted creature gets +2/+2 until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Enchanted creature has first strike.",
    },
  ],
});
