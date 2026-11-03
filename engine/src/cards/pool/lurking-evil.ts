import { defineCard } from "../define.js";

const TEXT = "Pay half your life, rounded up: This enchantment becomes a 4/4 Phyrexian Horror creature with flying.";

export default defineCard({
  name: "Lurking Evil",
  manaCost: "{B}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: "half-rounded-up" },
      targets: [],
      // It's no longer an enchantment (its ruling).
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Phyrexian", "Horror"],
        keywords: ["flying"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
