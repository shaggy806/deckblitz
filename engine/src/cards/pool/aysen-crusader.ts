import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 29437.
//
// Rulings:
//   [2008-10-01] Aysen Crusader's ability counts the number of permanents you control that are
//     Soldiers and/or Warriors. A permanent with both creature types is counted only once.
//
// A characteristic-defining ability (rule 604.3): permanents, not just creatures, and the
// `subtypes` OR counts a Soldier Warrior once.

const TEXT =
  "Aysen Crusader's power and toughness are each equal to 2 plus the number of Soldiers and Warriors you control.";

export default defineCard({
  name: "Aysen Crusader",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 0,
  toughness: 0,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: {
        countOf: { countOf: { subtypes: ["Soldier", "Warrior"], controlledBy: "you" } },
        plusPower: 2,
        plusToughness: 2,
      },
      text: TEXT,
    },
  ],
});
