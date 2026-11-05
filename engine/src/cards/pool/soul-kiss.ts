import { defineCard } from "../define.js";

// EDHREC rank 27782.

export default defineCard({
  name: "Soul Kiss",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{B}, Pay 1 life: Enchanted creature gets +2/+2 until end of turn. Activate no more than three times each turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{B}", tap: false, payLife: 1 },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 2,
        toughness: 2,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{B}, Pay 1 life: Enchanted creature gets +2/+2 until end of turn. Activate no more than three times each turn.",
      timesEachTurn: 3,
    },
  ],
});
