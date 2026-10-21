import { defineCard } from "../define.js";

// EDHREC rank 23402.

export default defineCard({
  name: "Blessing",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{W}: Enchanted creature gets +1/+1 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}: Enchanted creature gets +1/+1 until end of turn.",
    },
  ],
});
