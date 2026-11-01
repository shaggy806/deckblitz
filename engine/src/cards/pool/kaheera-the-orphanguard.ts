import { defineCard } from "../define.js";

const COMPANION_TEXT = "Companion — Each creature card in your starting deck is a Cat, Elemental, Nightmare, Dinosaur, or Beast card.";
const LORD_TEXT = "Each other creature you control that's a Cat, Elemental, Nightmare, Dinosaur, or Beast gets +1/+1 and has vigilance.";
const TYPES = ["Cat", "Elemental", "Nightmare", "Dinosaur", "Beast"];

// A creature of more than one of the five types gets +1/+1 only once (the
// ruling): one static over all five.
export default defineCard({
  name: "Kaheera, the Orphanguard",
  manaCost: "{1}{G/W}{G/W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `${COMPANION_TEXT}\n${LORD_TEXT}`,
  companion: { kind: "each-card", of: "creature", test: { subtypeAmong: TYPES } },
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", subtypes: TYPES },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      grantKeywords: ["vigilance"],
      text: LORD_TEXT,
    },
  ],
});
