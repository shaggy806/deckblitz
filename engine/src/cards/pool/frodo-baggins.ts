import { defineCard } from "../define.js";

const TEMPT_TEXT = "Whenever Frodo Baggins or another legendary creature you control enters, the Ring tempts you.";
const BLOCK_TEXT = "As long as Frodo Baggins is your Ring-bearer, it must be blocked if able.";

// Rulings: only one creature is required to block it; a creature that can't
// block (or would have to pay a cost to) doesn't have to — the
// `must-be-blocked-if-able` restriction's own reading.
export default defineCard({
  name: "Frodo Baggins",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Halfling", "Scout"],
  power: 1,
  toughness: 3,
  text: `${TEMPT_TEXT}\n${BLOCK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: TEMPT_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "creature", supertype: "legendary" },
        otherOnly: true,
      },
      sameAbilityAs: 0,
      targets: [],
      effect: { kind: "the-ring-tempts-you" },
      resolve: null,
      text: TEMPT_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { ringBearer: true } },
      restrictions: ["must-be-blocked-if-able"],
      text: BLOCK_TEXT,
    },
  ],
});
