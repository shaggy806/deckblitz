import { defineCard } from "../define.js";

// The lock stops the creatures' controllers; Drana and Linvala's copies are
// its own abilities, so it doesn't reach them — and only those copies may be
// paid for with mana as though it were any color.
const LOCK_TEXT = "Activated abilities of creatures your opponents control can't be activated.";
const GRANT_TEXT = "Drana and Linvala has all activated abilities of all creatures your opponents control.";
const SPEND_TEXT = "You may spend mana as though it were mana of any color to activate those abilities.";

export default defineCard({
  name: "Drana and Linvala",
  manaCost: "{1}{W}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Vampire", "Angel"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${LOCK_TEXT}\n${GRANT_TEXT} ${SPEND_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", abilitiesOf: { type: "creature", controlledBy: "opponent" } },
      text: LOCK_TEXT,
    },
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "battlefield", filter: { type: "creature", controlledBy: "opponent" } },
      text: GRANT_TEXT,
    },
    {
      affects: { scope: "self" },
      spendManaAs: { as: "any-color", activating: "granted" },
      text: SPEND_TEXT,
    },
  ],
});
