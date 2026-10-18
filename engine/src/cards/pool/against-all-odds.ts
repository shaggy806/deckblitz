import { defineCard } from "../define.js";

// EDHREC rank 9888.

const FLICKER_TEXT =
  "Exile target artifact or creature you control, then return it to the battlefield under its owner's control.";
const RETURN_TEXT =
  "Return target artifact or creature card with mana value 3 or less from your graveyard to the battlefield.";

export default defineCard({
  name: "Against All Odds",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${FLICKER_TEXT}\n• ${RETURN_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      {
        text: FLICKER_TEXT,
        targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
        effect: { kind: "flicker", target: 0 },
      },
      {
        text: RETURN_TEXT,
        targets: [
          {
            kind: "card-in-graveyard",
            whose: "you",
            filter: { typesAnyOf: ["artifact", "creature"], manaValue: { op: "lte", n: 3 } },
          },
        ],
        effect: { kind: "put-onto-battlefield", target: 0 },
      },
    ],
  },
});
