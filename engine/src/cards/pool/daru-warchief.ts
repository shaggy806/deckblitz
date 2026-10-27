import { defineCard } from "../define.js";

export default defineCard({
  name: "Daru Warchief",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: "Soldier spells you cast cost {1} less to cast.\nSoldier creatures you control get +1/+2.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Soldier" }, caster: "you", reduceGeneric: 1 },
      text: "Soldier spells you cast cost {1} less to cast.",
    },
    {
      // Itself included: it's a Soldier creature you control.
      affects: { scope: "creatures-you-control", subtype: "Soldier" },
      grantPt: [1, 2],
      text: "Soldier creatures you control get +1/+2.",
    },
  ],
});
