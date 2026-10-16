import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// EDHREC rank 10256. Ravnica: Clue Edition (CLU).
//
// Spells cast before Lavinia count toward "your second spell" (the ruling).
// "During an opponent's turn" is any turn but yours: every other player is an
// opponent.
const CAST_TEXT = "Whenever you cast your second spell each turn, investigate.";
const MANA_TEXT = "{T}: Add {C}{C}. Activate only during an opponent's turn.";

export default defineCard({
  name: "Lavinia, Foil to Conspiracy",
  manaCost: "{1}{W/U}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Detective"],
  power: 2,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${CAST_TEXT} (Create a Clue token. It's an artifact with "{2}, Sacrifice this token: Draw a card.")\n${MANA_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 2 },
      resolve: null,
      condition: { kind: "not", of: { kind: "your-turn" } },
      text: MANA_TEXT,
    },
  ],
});
