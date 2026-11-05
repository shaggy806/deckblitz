import { defineCard } from "../define.js";

const TAPPED_TEXT = "Creatures enchanted player controls enter tapped.";

export default defineCard({
  name: "Radiant Restraints",
  art: "https://cards.scryfall.io/art_crop/back/4/a/4a708243-42a1-4fa7-8b0b-9d5163da84bb.jpg",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura", "Curse"],
  targets: ["player"],
  text: `Enchant player\n${TAPPED_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "others-enter-battlefield",
        filter: { type: "creature", controlledBy: "enchanted-player" },
        tapped: true,
      },
      text: TAPPED_TEXT,
    },
  ],
  faces: ["Radiant Grace", "Radiant Restraints"],
  transform: true,
});
