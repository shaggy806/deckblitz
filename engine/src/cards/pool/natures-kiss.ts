import { defineCard } from "../define.js";

// EDHREC rank 31310.

export default defineCard({
  name: "Nature's Kiss",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{1}, Exile the top card of your graveyard: Enchanted creature gets +1/+1 until end of turn.",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{1}", tap: false, exileFromGraveyard: { count: 1, fromTop: true } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "attached",
        power: 1,
        toughness: 1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{1}, Exile the top card of your graveyard: Enchanted creature gets +1/+1 until end of turn.",
    },
  ],
});
