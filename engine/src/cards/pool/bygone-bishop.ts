import { defineCard } from "../define.js";

// EDHREC rank 7584.
//
// The spell's mana value, not what was paid: an alternative cost doesn't
// change it (the ruling).
const CLUE_TEXT =
  "Whenever you cast a creature spell with mana value 3 or less, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

export default defineCard({
  name: "Bygone Bishop",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit", "Cleric"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${CLUE_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: CLUE_TEXT,
    },
  ],
});
