import { defineCard } from "../define.js";
import { forecast } from "../helpers.js";

// Dissension (DIS). EDHREC rank 17712.
//
// Ruling: the two creatures tapped for the forecast cost may be ones you
// haven't controlled since your turn began (a `tapOthers` cost has no {T}).
export default defineCard({
  name: "Sky Hussar",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, untap all creatures you control.\nForecast — Tap two untapped white and/or blue creatures you control, Reveal this card from your hand: Draw a card. (Activate only during your upkeep and only once each turn.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "untap-all", filter: { type: "creature", controlledBy: "you" } },
      resolve: null,
      text: "When this creature enters, untap all creatures you control.",
    },
  ],
  activated: [
    forecast({
      cost: {
        mana: null,
        tap: false,
        tapOthers: {
          count: 2,
          filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["W"] }, { colors: ["U"] }] },
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Forecast — Tap two untapped white and/or blue creatures you control, Reveal this card from your hand: Draw a card. (Activate only during your upkeep and only once each turn.)",
    }),
  ],
});
