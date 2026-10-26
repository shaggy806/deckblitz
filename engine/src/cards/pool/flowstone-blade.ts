import { defineCard } from "../define.js";

// EDHREC rank 29248.

export default defineCard({
  name: "Flowstone Blade",
  manaCost: "{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{R}: Enchanted creature gets +1/-1 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{R}: Enchanted creature gets +1/-1 until end of turn.",
    },
  ],
});
