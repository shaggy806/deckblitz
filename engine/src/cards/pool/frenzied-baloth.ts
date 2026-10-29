import { defineCard } from "../define.js";

// Rulings: "Combat damage can't be prevented" stops only effects that use the
// word "prevent" — protection's prevention included (rule 615.12).

export default defineCard({
  name: "Frenzied Baloth",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 2,
  keywords: ["trample", "haste"],
  cantBeCountered: true,
  text: "This spell can't be countered.\nTrample, haste\nCreature spells you control can't be countered.\nCombat damage can't be prevented.",
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "creature" }, cantBeCountered: true },
      text: "Creature spells you control can't be countered.",
    },
    {
      affects: { scope: "self" },
      damageCantBePrevented: { combat: true },
      text: "Combat damage can't be prevented.",
    },
  ],
});
