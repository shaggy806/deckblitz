import { defineCard } from "../define.js";

// EDHREC rank 20952. Weatherlight.
//
// The Aura is gone by the time its ability resolves (sacrificed for the
// cost), so "enchanted creature" is the creature it was last attached to
// (`to: "attached"`, rule 608.2h), still on the battlefield as the same
// object. The source is chosen as the ability resolves (rule 609.7a).

const EVASION_TEXT = "Enchanted creature can't be blocked by creatures with power 3 or greater.";
const SHIELD_TEXT =
  "Sacrifice this Aura: The next time a source of your choice would deal damage to enchanted creature this turn, prevent that damage.";

export default defineCard({
  name: "Kithkin Armor",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${EVASION_TEXT}\n${SHIELD_TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: [{ kind: "cant-be-blocked", by: { power: { op: "gte", n: 3 } } }],
      text: EVASION_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "prevent-damage-from-chosen-source", to: "attached", amount: "next-time" },
      resolve: null,
      text: SHIELD_TEXT,
    },
  ],
});
