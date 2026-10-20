import { defineCard } from "../define.js";

// EDHREC rank 10354. Kaldheim. A snow permanent is any permanent with the snow
// supertype.

const ENTERS_TEXT =
  "When this creature enters, search your library for a snow land card, reveal it, put it into your hand, then shuffle.";
const PUMP_TEXT = "This creature gets +1/+0 for each other snow permanent you control.";

export default defineCard({
  name: "Spirit of the Aldergard",
  manaCost: "{3}{G}",
  colors: ["G"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Bear", "Spirit"],
  power: 0,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "snow" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { supertype: "snow", controlledBy: "you" }, pt: [1, 0], excludeSelf: true },
      text: PUMP_TEXT,
    },
  ],
});
