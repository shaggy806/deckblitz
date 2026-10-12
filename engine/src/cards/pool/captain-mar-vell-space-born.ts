import { defineCard } from "../define.js";

// EDHREC rank 15887.
//
// Quicksilver, Speedster's permission, gated on an opponent's spell this
// turn: any opponent's cast counts (a copy isn't cast), whether or not the
// spell resolved.
const FLASH_TEXT =
  "Cosmic Awareness — As long as an opponent has cast a spell this turn, you may cast spells as though they had flash.";

export default defineCard({
  name: "Captain Mar-Vell, Space-Born",
  manaCost: "{4}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Kree", "Soldier", "Hero"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${FLASH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "cast-this-turn", who: "opponent" },
      castAsThoughFlash: true,
      text: FLASH_TEXT,
    },
  ],
});
