import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 29750. The creature and the Aura go back
// together, as one event.
const TEXT = "{U}: Return enchanted creature and this Aura to their owners' hands.";

export default defineCard({
  name: "Disappear",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "return-to-hand", target: "attached" },
          { kind: "return-to-hand", target: "source" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
