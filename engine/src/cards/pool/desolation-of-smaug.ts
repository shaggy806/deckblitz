import { defineCard } from "../define.js";

// EDHREC rank 10777.
//
// The damage comes first, then the mana: four units, each its own colour
// choice ("any combination of colors"), each carrying the Dragon-spell
// restriction (rule 106.6b) — they empty from the pool as the step ends.
const DAMAGE_TEXT = "Desolation of Smaug deals 3 damage to each non-Dragon creature.";
const MANA_TEXT = "Add four mana in any combination of colors. Spend this mana only to cast Dragon spells.";

export default defineCard({
  name: "Desolation of Smaug",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${DAMAGE_TEXT}\n${MANA_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-all", filter: { type: "creature", notSubtypes: ["Dragon"] }, amount: 3 },
      {
        kind: "add-mana",
        mana: { oneOf: ["W", "U", "B", "R", "G"] },
        amount: 4,
        spendOnly: { spell: { subtype: "Dragon" }, text: "Spend this mana only to cast Dragon spells." },
      },
    ],
  },
});
