import { defineCard } from "../define.js";

const SPELL_TEXT = "{U}{R}: Copy target instant or sorcery spell you control. Activate this ability only once.";
const CREATURE_TEXT =
  "{G}{U}: Copy target creature spell you control. Activate this ability only once. (Copies of permanent spells enter the battlefield as tokens.)";

export default defineCard({
  name: "Riku and Riku",
  manaCost: "{2}{R/G}{U}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike\n${SPELL_TEXT}\n${CREATURE_TEXT}`,
  activated: [
    {
      cost: { mana: "{U}{R}", tap: false },
      targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
      // No "you may choose new targets": the copy keeps the original's (rule 707.10c).
      effect: { kind: "copy-spell", target: 0 },
      resolve: null,
      text: SPELL_TEXT,
      onlyOnce: true,
    },
    {
      cost: { mana: "{G}{U}", tap: false },
      targets: [{ kind: "spell", whose: "you", filter: { type: "creature" } }],
      effect: { kind: "copy-spell", target: 0 },
      resolve: null,
      text: CREATURE_TEXT,
      onlyOnce: true,
    },
  ],
});
