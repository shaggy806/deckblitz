import { defineCard } from "../define.js";

// EDHREC rank 22167.

const DRAW_TEXT =
  "Whenever you cast an Equipment spell or a spell that targets a creature you control, draw a card. This ability triggers only once each turn.";

export default defineCard({
  name: "Danitha, Sword of Hope",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "you",
        filter: {
          anyOf: [{ subtype: "Equipment" }, { targets: { permanent: { type: "creature", controlledBy: "you" } } }],
        },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: DRAW_TEXT,
    },
  ],
});
