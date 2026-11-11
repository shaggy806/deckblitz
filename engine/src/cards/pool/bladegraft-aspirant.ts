import { defineCard } from "../define.js";

// The ability discount reaches any activated ability of an Equipment you
// control, equip or not, but only an activation with this creature among its
// chosen targets (`targetingSource`).
export default defineCard({
  name: "Bladegraft Aspirant",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text:
    "Menace\n" +
    "Equipment spells you cast cost {1} less to cast.\n" +
    "Activated abilities of Equipment you control that target this creature cost {1} less to activate.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Equipment" }, reduceGeneric: 1, when: { caster: "you" } },
      text: "Equipment spells you cast cost {1} less to cast.",
    },
    {
      affects: { scope: "self" },
      abilityCostModification: {
        applies: { subtype: "Equipment", controlledBy: "you" },
        targetingSource: true,
        reduceGeneric: 1,
      },
      text: "Activated abilities of Equipment you control that target this creature cost {1} less to activate.",
    },
  ],
});
