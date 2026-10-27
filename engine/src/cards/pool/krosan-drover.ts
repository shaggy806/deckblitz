import { defineCard } from "../define.js";

export default defineCard({
  name: "Krosan Drover",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf"],
  power: 2,
  toughness: 2,
  text: "Creature spells you cast with mana value 6 or greater cost {2} less to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: {
        applies: { type: "creature", manaValue: { op: "gte", n: 6 } },
        caster: "you",
        reduceGeneric: 2,
      },
      text: "Creature spells you cast with mana value 6 or greater cost {2} less to cast.",
    },
  ],
});
