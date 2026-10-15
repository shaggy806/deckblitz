import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

/** The back face of Sidequest: Card Collection — a blue (colour indicator)
 * 4/4 flying Vehicle with crew 1. */
export default defineCard({
  name: "Magicked Card",
  // A back face has no Scryfall card of its own name — point at its art.
  art: "https://cards.scryfall.io/art_crop/back/8/a/8ac3d2c9-5978-4cfb-a746-c901decff093.jpg",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${crewText(1)}`,
  activated: [crew(1)],
  faces: ["Sidequest: Card Collection", "Magicked Card"],
  transform: true,
});
