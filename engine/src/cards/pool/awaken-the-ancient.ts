import { defineCard } from "../define.js";

// EDHREC rank 21404.
//
// The Mountain keeps its other types, subtypes and abilities (the ruling): a
// creature added in layer 4, red in layer 5, Giant added, base 7/7 in layer
// 7b. Enchant Mountain is the target filter, so it falls off a land that
// stops being a Mountain.

const TEXT = "Enchanted Mountain is a 7/7 red Giant creature with haste. It's still a land.";

export default defineCard({
  name: "Awaken the Ancient",
  manaCost: "{1}{R}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant Mountain\n${TEXT}`,
  targets: [{ kind: "permanent", filter: { subtype: "Mountain" } }],
  static: [
    {
      affects: { scope: "attached" },
      addTypes: ["creature"],
      addSubtypes: ["Giant"],
      setColors: ["R"],
      setBasePt: { power: 7, toughness: 7 },
      grantKeywords: ["haste"],
      text: TEXT,
    },
  ],
});
