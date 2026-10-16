import { defineCard } from "../define.js";

// EDHREC rank 13744.
const ENTER =
  "When this creature enters, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const DELIRIUM =
  "Delirium — This creature gets +1/+2 and has vigilance as long as there are four or more card types among cards in your graveyard.";

export default defineCard({
  name: "Spineseeker Centipede",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 1,
  text: `${ENTER}\n${DELIRIUM}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTER,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "delirium" },
      grantPt: [1, 2],
      grantKeywords: ["vigilance"],
      text: DELIRIUM,
    },
  ],
});
