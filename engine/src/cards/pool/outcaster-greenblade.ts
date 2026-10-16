import { defineCard } from "../define.js";

// EDHREC rank 13900.
//
// "A basic land card or a Desert card" is one filter with an `anyOf` (Map the
// Frontier).
const ENTER =
  "When this creature enters, search your library for a basic land card or a Desert card, reveal it, put it into your hand, then shuffle.";
const PUMP = "This creature gets +1/+1 for each Desert you control.";

export default defineCard({
  name: "Outcaster Greenblade",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 1,
  toughness: 2,
  text: `${ENTER}\n${PUMP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Desert" }] },
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
      grantPtPerCount: { filter: { subtype: "Desert", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP,
    },
  ],
});
