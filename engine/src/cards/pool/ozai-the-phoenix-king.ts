import { firebending } from "../helpers.js";
import { defineCard } from "../define.js";

const LOSE_TEXT = "If you would lose unspent mana, that mana becomes red instead.";
const AS_LONG_TEXT = "Ozai has flying and indestructible as long as you have six or more unspent mana.";

// EDHREC rank 3748. A replacement of losing mana (`unspentManaBecomes`) and a
// keyword condition read off the pool (rule 106.4).
export default defineCard({
  name: "Ozai, the Phoenix King",
  manaCost: "{2}{B}{B}{R}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 7,
  toughness: 7,
  keywords: ["trample", "haste"],
  text: `Trample, firebending 4, haste\n${LOSE_TEXT}\n${AS_LONG_TEXT}`,
  static: [
    { affects: { scope: "self" }, unspentManaBecomes: "R", text: LOSE_TEXT },
    {
      affects: { scope: "self" },
      condition: { kind: "unspent-mana", atLeast: 6 },
      grantKeywords: ["flying", "indestructible"],
      text: AS_LONG_TEXT,
    },
  ],
  triggered: [firebending(4, "Firebending 4")],
});
