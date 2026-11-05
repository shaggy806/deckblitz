import { defineCard } from "../define.js";

const TEXT =
  "For each non-Human creature you control, you may have that creature assign its combat damage as though it weren't blocked.";

export default defineCard({
  name: "Zilortha, Apex of Ikoria",
  art: "https://cards.scryfall.io/art_crop/back/5/d/5d59c8f2-f6af-40a6-8dfe-8cc45bf231ce.jpg",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 8,
  toughness: 8,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", notSubtypes: ["Human"] } },
      assignAsThoughUnblocked: true,
      text: TEXT,
    },
  ],
  faces: ["Invasion of Ikoria", "Zilortha, Apex of Ikoria"],
  transform: true,
});
