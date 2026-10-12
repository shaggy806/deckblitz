import { defineCard } from "../define.js";

/**
 * Ka-Zar of the Savage Land's token — "Zabu, a legendary 2/2 green Cat
 * creature token with 'Landfall — Whenever a land you control enters, put a
 * +1/+1 counter on Zabu.'" A named token whose name collides with no card,
 * so it's keyed by that name (Doombot's shape).
 */
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, put a +1/+1 counter on Zabu.";

export default defineCard({
  name: "Zabu",
  art: "8ff55043-379e-400c-9847-30b75e4a1322",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 2,
  toughness: 2,
  text: LANDFALL_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
});
