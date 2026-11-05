import { defineCard } from "../define.js";

// EDHREC rank 30694.

export default defineCard({
  name: "Bartel Runeaxe",
  manaCost: "{3}{B}{R}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 6,
  toughness: 5,
  keywords: ["vigilance"],
  text: "Vigilance\nBartel Runeaxe can't be the target of Aura spells.",
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { filter: { subtype: "Aura" }, spellsOnly: true, anyController: true, notHexproof: true },
      text: "Bartel Runeaxe can't be the target of Aura spells.",
    },
  ],
});
