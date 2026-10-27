import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 28511. Saprazzan Legate's `freeCastIf`.

export default defineCard({
  name: "Cho-Arrim Legate",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "If an opponent controls a Swamp and you control a Plains, you may cast this spell without paying its mana cost.\nProtection from black",
  freeCastIf: {
    condition: {
      kind: "all",
      of: [
        { kind: "opponent-controls", filter: { subtype: "Swamp" }, atLeast: 1 },
        { kind: "controls", filter: { subtype: "Plains" }, atLeast: 1 },
      ],
    },
  },
  static: [
    {
      affects: { scope: "self" },
      protection: { colors: ["B"] },
      text: "Protection from black",
    },
  ],
});
