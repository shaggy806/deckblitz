import { defineCard } from "../define.js";

// "Look at the top card … if it's a land card, you may put it onto the
// battlefield. If you don't …, put it into your hand" is Wickerfolk
// Thresher's look-and-choose; the trigger is the transform into this face.

const TEXT =
  "When this creature transforms into Skyclave Invader, look at the top card of your library. If it's a land card, you may put it onto the battlefield. If you don't put the card onto the battlefield, put it into your hand.";

export default defineCard({
  name: "Skyclave Invader",
  art: "https://cards.scryfall.io/art_crop/back/c/d/cd1c8e1a-bd38-47a2-a55a-682ebaede960.jpg",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Merfolk", "Scout"],
  power: 2,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "transforms", who: "self", intoFront: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 1,
        min: 0,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  faces: ["Skyclave Aerialist", "Skyclave Invader"],
  transform: true,
});
