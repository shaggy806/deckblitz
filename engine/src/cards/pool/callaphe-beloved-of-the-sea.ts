import { defineCard } from "../define.js";

// Callaphe's power is a characteristic-defining ability, in every zone (the
// ruling). The granted tax is one instance per permanent, an enchantment
// creature included, Callaphe itself too (the rulings).

const TAX_TEXT = "Spells your opponents cast that target this permanent cost {1} more to cast.";
const GRANT_TEXT = `Creatures and enchantments you control have "${TAX_TEXT}"`;

export default defineCard({
  name: "Callaphe, Beloved of the Sea",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["enchantment", "creature"],
  subtypes: ["Demigod"],
  power: 0,
  toughness: 3,
  text: `Callaphe's power is equal to your devotion to blue. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { devotionTo: ["U"] }, plusPower: 0, plusToughness: 0, only: "power" },
      text: "Callaphe's power is equal to your devotion to blue.",
    },
    {
      affects: { scope: "filter", filter: { typesAnyOf: ["creature", "enchantment"], controlledBy: "you" } },
      grantsStatic: [{ affects: { scope: "self" }, targetedBySpellsCost: { payGeneric: 1 }, text: TAX_TEXT }],
      text: GRANT_TEXT,
    },
  ],
});
