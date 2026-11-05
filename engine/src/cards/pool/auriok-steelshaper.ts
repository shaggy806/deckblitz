import { defineCard } from "../define.js";

const EQUIP_TEXT = "Equip costs you pay cost {1} less.";
const ANTHEM_TEXT = "As long as this creature is equipped, each creature you control that's a Soldier or a Knight gets +1/+1.";

export default defineCard({
  name: "Auriok Steelshaper",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${EQUIP_TEXT}\n${ANTHEM_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      abilityCostModification: { applies: {}, abilityKind: "equip", byYou: true, reduceGeneric: 1 },
      text: EQUIP_TEXT,
    },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", subtypes: ["Soldier", "Knight"] } },
      condition: { kind: "source", filter: { equipped: true } },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
});
