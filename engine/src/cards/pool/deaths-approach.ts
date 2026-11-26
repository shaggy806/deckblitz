import { defineCard } from "../define.js";

// X is read continuously, from the graveyard of whoever controls the
// enchanted creature now (`fromAffectedController`), not the Aura's
// controller's.

const TEXT = "Enchanted creature gets -X/-X, where X is the number of creature cards in its controller's graveyard.";

export default defineCard({
  name: "Death's Approach",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: {
        inGraveyard: { type: "creature", ownedBy: "you" },
        fromAffectedController: true,
        pt: [-1, -1],
      },
      text: TEXT,
    },
  ],
});
