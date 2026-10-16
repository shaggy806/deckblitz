import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// Descend 8 (an ability word): eight or more permanent cards — artifact,
// battle, creature, enchantment, land or planeswalker — in your graveyard,
// read live as Cephalid Inkmage's threshold is.
const DESCEND_TEXT =
  "Descend 8 — This Vehicle can't be blocked as long as there are eight or more permanent cards in your graveyard.";

export default defineCard({
  name: "Watertight Gondola",
  art: "https://cards.scryfall.io/art_crop/back/7/e/7ea89d3c-8d47-4bbb-9271-8cdfd9296e2f.jpg",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${DESCEND_TEXT}\n${crewText(1)}`,
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "cards-in-graveyard",
        atLeast: 8,
        filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
      },
      grantKeywords: ["unblockable"],
      text: DESCEND_TEXT,
    },
  ],
  activated: [crew(1)],
  faces: ["Waterlogged Hulk", "Watertight Gondola"],
  transform: true,
});
