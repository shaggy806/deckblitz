import { defineCard } from "../define.js";

// EDHREC 3518 (batch 315). A spell's mana value counts the X chosen for it
// (rule 202.3e), so the discount reads it as the cost is worked out (601.2f
// — the cost modification's `castX`), and the "can't be countered" grant as
// it would be countered. Thryx's ability doesn't apply to itself while it's
// a spell (its ruling): it isn't on the battlefield yet.
const STORM_TEXT = "Spells you cast with mana value 5 or greater cost {1} less to cast and can't be countered.";

export default defineCard({
  name: "Thryx, the Sudden Storm",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elemental", "Giant"],
  power: 4,
  toughness: 5,
  keywords: ["flash", "flying"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\nFlying\n${STORM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { manaValue: { op: "gte", n: 5 } }, reduceGeneric: 1, when: { caster: "you" } },
      grantsToSpells: { filter: { manaValue: { op: "gte", n: 5 }, castBy: "you" }, cantBeCountered: true },
      text: STORM_TEXT,
    },
  ],
});
