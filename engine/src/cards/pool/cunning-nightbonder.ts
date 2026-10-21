import { defineCard } from "../define.js";

// EDHREC rank 10371. Ikoria: Lair of Behemoths.
//
// Two statics over spells with flash: the discount (generic mana only, its
// ruling) on spells you cast, and "can't be countered" on spells you control
// that were cast by you — `cast: true` keeps a copy out (a copy is never cast,
// its ruling). Neither applies to Nightbonder itself while it's a spell, since
// both work only from the battlefield.
const TEXT = "Spells with flash you cast cost {1} less to cast and can't be countered.";

export default defineCard({
  name: "Cunning Nightbonder",
  manaCost: "{U/B}{U/B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { keyword: "flash" }, caster: "you", reduceGeneric: 1 },
      text: TEXT,
    },
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { keyword: "flash", cast: true, castBy: "you" }, cantBeCountered: true },
      text: TEXT,
    },
  ],
});
