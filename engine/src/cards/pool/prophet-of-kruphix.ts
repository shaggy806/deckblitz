import { defineCard } from "../define.js";

// Rulings:
//   Controlling more than one Prophet of Kruphix doesn't allow you to untap any creature or land
//     more than once during a single untap step. (One untap pass per permanent.)
//   Creatures and lands you control untap at the same time as the active player's permanents. You
//     can't choose to not untap them at that time.
//   Effects that state a creature or land you control doesn't untap during your untap step won't
//     apply during another player's untap step. (`doesntUntap` is read only in your own.)
//   The last ability applies to creature cards in any zone, provided something is allowing you
//     to cast them.
const UNTAP_TEXT = "Untap all creatures and lands you control during each other player's untap step.";
const FLASH_TEXT = "You may cast creature spells as though they had flash.";

export default defineCard({
  name: "Prophet of Kruphix",
  manaCost: "{3}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${UNTAP_TEXT}\n${FLASH_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      untapsDuringOthersUntap: { typesAnyOf: ["creature", "land"] },
      text: UNTAP_TEXT,
    },
    {
      affects: { scope: "self" },
      castAsThoughFlash: { type: "creature" },
      text: FLASH_TEXT,
    },
  ],
});
