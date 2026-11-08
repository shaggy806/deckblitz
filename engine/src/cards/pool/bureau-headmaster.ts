import { defineCard } from "../define.js";

const SPELL_TEXT = "Equipment spells you cast cost {1} less to cast.";
const EQUIP_TEXT = "Equip abilities you activate cost {1} less to activate.";

export default defineCard({
  name: "Bureau Headmaster",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 2,
  toughness: 2,
  text: `${SPELL_TEXT}\n${EQUIP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Equipment" }, reduceGeneric: 1, when: { caster: "you" } },
      text: SPELL_TEXT,
    },
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, reduceGeneric: 1 },
      text: EQUIP_TEXT,
    },
  ],
});
