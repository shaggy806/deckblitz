import { defineCard } from "../define.js";

const PLUS_TEXT = "+1: Scry 1. Saheeli Rai deals 1 damage to each opponent.";
const COPY_TEXT =
  "−2: Create a token that's a copy of target artifact or creature you control, except it's an artifact in addition to its other types. That token gains haste. Exile it at the beginning of the next end step.";
const ULT_TEXT =
  "−7: Search your library for up to three artifact cards with different names, put them onto the battlefield, then shuffle.";

// "Artifact in addition" is a copy exception (copiable — the ruling);
// "that token gains haste" is an effect on the token with no end, not
// copiable (Saheeli, the Sun's Brilliance's shape). The three artifacts of
// the −7 enter together (a tutor's finds are one event).
export default defineCard({
  name: "Saheeli Rai",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Saheeli"],
  loyalty: 3,
  text: `${PLUS_TEXT}\n${COPY_TEXT}\n${ULT_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "scry", amount: 1 },
          { kind: "damage", amount: 1, who: "each-opponent" },
        ],
      },
      resolve: null,
      text: PLUS_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: {
        kind: "create-token-copy",
        of: 0,
        count: 1,
        who: "you",
        exceptions: { addTypes: ["artifact"] },
        gains: { keywords: ["haste"] },
        exileAtEndStep: true,
      },
      resolve: null,
      text: COPY_TEXT,
    },
    {
      loyaltyCost: -7,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "artifact" },
        destination: "battlefield",
        min: 0,
        max: 3,
        together: { distinctNames: true },
      },
      resolve: null,
      text: ULT_TEXT,
    },
  ],
});
