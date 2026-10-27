import { defineCard } from "../define.js";

// EDHREC rank 13806.
// Brawn's shape: the static works only from its owner's graveyard (`fromGraveyard`).

const GRAVEYARD_TEXT =
  "As long as this card is in your graveyard and you control a Plains, creatures you control have first strike.";

export default defineCard({
  name: "Valor",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Incarnation"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${GRAVEYARD_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      fromGraveyard: true,
      condition: { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      grantKeywords: ["first-strike"],
      text: GRAVEYARD_TEXT,
    },
  ],
});
