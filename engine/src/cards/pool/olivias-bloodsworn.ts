import { defineCard } from "../define.js";

const HASTE_TEXT = "{R}: Target Vampire gains haste until end of turn.";

export default defineCard({
  name: "Olivia's Bloodsworn",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Soldier"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\nThis creature can't block.\n${HASTE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      restrictions: ["cant-block"],
      text: "This creature can't block.",
    },
  ],
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Vampire" } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      resolve: null,
      text: HASTE_TEXT,
    },
  ],
});
