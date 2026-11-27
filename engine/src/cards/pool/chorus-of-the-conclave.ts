import { defineCard } from "../define.js";

// Guildpact.
//
// Rulings:
//   [2005-10-01] Chorus of the Conclave's ability works only while it's on the battlefield, so you
//     can't use it to put +1/+1 counters on itself.
//   [2005-10-01] Chorus of the Conclave's ability applies to creature spells only as they're being
//     cast. You can't pay mana to put counters on creatures being put onto the battlefield by an
//     effect.
//   [2005-10-01] Chorus of the Conclave's ability combines well with the convoke mechanic.
//
// `grantsToSpells.anyAmountOfMana`: the caster's creature spells ("you", rule 109.5) may pay any
// amount of generic mana more (601.2b, 601.2f), one cast offer per amount, and enter with that many
// +1/+1 counters.

const TEXT =
  "As an additional cost to cast creature spells, you may pay any amount of mana. If you do, that creature enters with that many additional +1/+1 counters on it.";

export default defineCard({
  name: "Chorus of the Conclave",
  manaCost: "{4}{G}{G}{W}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dryad"],
  power: 3,
  toughness: 8,
  keywords: ["forestwalk"],
  text: `Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, anyAmountOfMana: { counter: "+1/+1" } },
      text: TEXT,
    },
  ],
});
