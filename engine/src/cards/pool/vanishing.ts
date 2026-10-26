import { defineCard } from "../define.js";

// EDHREC rank 8274.
//
// The enchanted creature phases out (Robe of Stars' `attachedToSource`), and
// this Aura with it, indirectly (rule 702.26g); both phase in during the
// untap step of the player who controlled the creature (502.1).

export default defineCard({
  name: "Vanishing",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\n{U}{U}: Enchanted creature phases out. (While it's phased out, it's treated as though it doesn't exist. It phases in before its controller untaps during their next untap step.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{U}{U}", tap: false },
      targets: [],
      effect: { kind: "phase-out", attachedToSource: true },
      resolve: null,
      text: "{U}{U}: Enchanted creature phases out.",
    },
  ],
});
