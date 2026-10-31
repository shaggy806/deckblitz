import { defineCard } from "../define.js";

// "That target this creature": only an equip activation that chose this
// creature as its target pays less (rules 601.2c, 601.2f via 602.2b).

const TEXT = "Equip abilities you activate that target this creature cost {2} less to activate.";

export default defineCard({
  name: "Dwarven Mauler",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dwarf", "Warrior"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, targetingSource: true, reduceGeneric: 2 },
      text: TEXT,
    },
  ],
});
