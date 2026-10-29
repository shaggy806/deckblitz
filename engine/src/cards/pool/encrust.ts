import { defineCard } from "../define.js";

// EDHREC rank 21721.
//
// Rulings:
//   [2014-07-18] Static and triggered abilities are unaffected by Encrust.
//   [2014-07-18] The permanent can be untapped by other spells and abilities.
//   [2016-06-08] Activated abilities contain a colon.
//
// "Its activated abilities": the host's alone, whoever activates them — mana
// abilities included.

const LOCK_TEXT =
  "Enchanted permanent doesn't untap during its controller's untap step and its activated abilities can't be activated.";

export default defineCard({
  name: "Encrust",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${LOCK_TEXT}`,
  targets: ["artifact-or-creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["doesnt-untap"],
      prohibits: { who: "each-player", abilitiesOf: { hostOfSource: true } },
      text: LOCK_TEXT,
    },
  ],
});
