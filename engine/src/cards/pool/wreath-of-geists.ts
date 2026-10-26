import { defineCard } from "../define.js";

// EDHREC rank 23405. X is read continuously (its ruling), from the Aura's
// controller's graveyard.

const TEXT = "Enchanted creature gets +X/+X, where X is the number of creature cards in your graveyard.";

export default defineCard({
  name: "Wreath of Geists",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      text: TEXT,
    },
  ],
});
