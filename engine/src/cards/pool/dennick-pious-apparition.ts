import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

const INVESTIGATE_TEXT =
  "Whenever one or more creature cards are put into graveyards from anywhere, investigate. This ability triggers only once each turn.";

export default defineCard({
  name: "Dennick, Pious Apparition",
  art: "https://cards.scryfall.io/art_crop/back/3/5/35cf2d72-931f-47b1-a1b4-916f0383551a.jpg",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${INVESTIGATE_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\nIf Dennick would be put into a graveyard from anywhere, exile it instead.`,
  triggered: [
    {
      trigger: { on: "put-into-graveyard", who: "any", filter: { type: "creature" }, batched: true },
      oncePerTurn: true,
      targets: [],
      effect: investigate(),
      resolve: null,
      text: INVESTIGATE_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-be-put-into-graveyard", instead: "exile", self: true },
      text: "If Dennick would be put into a graveyard from anywhere, exile it instead.",
    },
  ],
  faces: ["Dennick, Pious Apprentice", "Dennick, Pious Apparition"],
  transform: true,
});
