import { defineCard } from "../define.js";

// Limited Edition Alpha (LEA). EDHREC rank 16091.
const REGEN = "{G}: Regenerate enchanted creature.";

export default defineCard({
  name: "Regeneration",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature (Target a creature as you cast this. This card enters attached to that creature.)\n{G}: Regenerate enchanted creature. (The next time that creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: REGEN,
    },
  ],
});
