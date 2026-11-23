import { defineCard } from "../define.js";

// Playtest card: Teferi, Mage of Zhalfir in green, with the same rulings —
// the flash grant reaches creature cards you own in every zone but the
// battlefield, and the opponents' sorcery timing wins over any permission.

const FLASH_TEXT = "Creature cards you own that aren't on the battlefield have flash.";
const TIMING_TEXT = "Each opponent can cast spells only any time they could cast a sorcery.";

export default defineCard({
  name: "Teferi, Druid of Argoth",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${FLASH_TEXT}\n${TIMING_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      outsideBattlefield: { ofType: ["creature"], keywords: ["flash"] },
      text: FLASH_TEXT,
    },
    {
      affects: { scope: "self" },
      prohibits: [{ act: "cast", who: "opponents", unless: "sorcery-timing" }],
      text: TIMING_TEXT,
    },
  ],
});
