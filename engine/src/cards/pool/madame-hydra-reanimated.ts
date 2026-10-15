import { defineCard } from "../define.js";

// EDHREC rank 22789.

const PT_TEXT = "Madame Hydra gets +1/+1 for each creature card in your graveyard.";
const MILL_TEXT = "Whenever Madame Hydra enters or attacks, mill two cards.";

export default defineCard({
  name: "Madame Hydra, Reanimated",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Horror", "Villain"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${PT_TEXT}\n${MILL_TEXT} (Put the top two cards of your library into your graveyard.)`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "you" }, pt: [1, 1] },
      text: PT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "mill", target: "you", amount: 2 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
