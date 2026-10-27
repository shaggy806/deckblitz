import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 30073. Two protections (rule
// 702.16), each a subtype `filter` (Yawgmoth's shape), ORed: from Spirits
// (permanents and spells) and from Arcane (spells).

export default defineCard({
  name: "Kitsune Riftwalker",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Fox", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Protection from Spirits and from Arcane",
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      text: "Protection from Spirits and from Arcane",
    },
  ],
});
