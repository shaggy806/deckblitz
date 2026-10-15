import { defineCard } from "../define.js";

// The back face of Garland, Knight of Cornelia. Its dies trigger finds the
// card in the graveyard it went to (Murderous Rider's `trigger-object`).
const DIES_TEXT = "When Chaos dies, put it on the bottom of its owner's library.";

export default defineCard({
  name: "Chaos, the Endless",
  art: "https://cards.scryfall.io/art_crop/back/d/d/dd463dbe-5f2c-4d4f-86f8-ad8ff407af62.jpg",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: "bottom" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  faces: ["Garland, Knight of Cornelia", "Chaos, the Endless"],
  transform: true,
});
