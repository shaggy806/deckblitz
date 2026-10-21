import { defineCard } from "../define.js";

// EDHREC rank 9484. Avatar: The Last Airbender.

export default defineCard({
  name: "Watery Grasp",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature doesn't untap during its controller's untap step.\nWaterbend {5}: Enchanted creature's owner shuffles it into their library. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)",
  targets: ["creature"],
  activated: [
    {
      cost: { mana: "{5}", tap: false, waterbend: true },
      targets: [],
      effect: { kind: "shuffle-into-library", target: "attached" },
      resolve: null,
      text: "Waterbend {5}: Enchanted creature's owner shuffles it into their library.",
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      text: "Enchanted creature doesn't untap during its controller's untap step.",
    },
  ],
});
