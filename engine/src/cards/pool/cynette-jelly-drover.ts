import { defineCard } from "../define.js";

// EDHREC rank 12291.
//
// Rulings:
//   [2024-11-08] Because damage remains marked on a creature until it's removed as the turn ends,
//     nonlethal damage dealt to creatures you control with flying may become lethal if Cynette
//     leaves the battlefield during that turn.

const TOKEN_TEXT = "When Cynette enters or dies, create a 1/1 blue Jellyfish creature token with flying.";
const ANTHEM_TEXT = "Creatures you control with flying get +1/+1.";

// "Enters or dies" is two triggers (Undercellar Myconid); the anthem is
// Favorable Winds'.
export default defineCard({
  name: "Cynette, Jelly Drover",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${TOKEN_TEXT}\n${ANTHEM_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Jellyfish Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Jellyfish Token", count: 1 },
      resolve: null,
      text: TOKEN_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", withKeyword: "flying" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
