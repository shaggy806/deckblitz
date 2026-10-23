import { defineCard } from "../define.js";

const VIGILANCE_TEXT = "Eldrazi you control have vigilance.";
const SAC_TEXT = "{2}, {T}, Sacrifice a non-Eldrazi creature: Create a 3/2 colorless Eldrazi Horror creature token.";

export default defineCard({
  name: "Extricator of Flesh",
  art: "https://cards.scryfall.io/art_crop/back/b/6/b6867ddd-f953-41c6-ba36-86ae2c14c908.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Horror"],
  power: 3,
  toughness: 5,
  text: `${VIGILANCE_TEXT}\n${SAC_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Eldrazi", controlledBy: "you" } },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "creature", notSubtypes: ["Eldrazi"] } } },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Horror Token", count: 1 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
  faces: ["Extricator of Sin", "Extricator of Flesh"],
  transform: true,
});
