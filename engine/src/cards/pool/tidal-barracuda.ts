import { defineCard } from "../define.js";

const FLASH_TEXT = "Any player may cast spells as though they had flash.";
const LOCK_TEXT = "Your opponents can't cast spells during your turn.";

// A prohibition beats a permission (rule 101.2): during its controller's
// turn, the opponents' flash permission is no help to them.
export default defineCard({
  name: "Tidal Barracuda",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 3,
  toughness: 4,
  text: `${FLASH_TEXT}\n${LOCK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      castAsThoughFlash: true,
      castAsThoughFlashAnyPlayer: true,
      text: FLASH_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "your-turn" },
      prohibits: { who: "opponents", spells: true },
      text: LOCK_TEXT,
    },
  ],
});
