import { defineCard } from "../define.js";
import { outlast } from "../helpers.js";

// The granted outlast is the same ability as the printed one (rule
// 702.107a), its "this creature" the creature that has it (Clan Crafter's
// granted `"source"`). A creature with a +1/+1 counter loses it.
const OUTLAST_TEXT = "Outlast {G/W} ({G/W}, {T}: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)";
const GRANT_TEXT = "Each other creature you control without a +1/+1 counter on it has outlast {G/W}.";

export default defineCard({
  name: "Arcus Acolyte",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Archer"],
  power: 2,
  toughness: 2,
  keywords: ["reach", "lifelink"],
  text: `Reach, lifelink\n${OUTLAST_TEXT}\n${GRANT_TEXT}`,
  activated: [outlast("{G/W}")],
  static: [
    {
      affects: {
        scope: "filter",
        filter: {
          type: "creature",
          controlledBy: "you",
          counters: { kind: "+1/+1", compare: { op: "eq", n: 0 } },
        },
        excludeSelf: true,
      },
      grantsActivated: [outlast("{G/W}")],
      text: GRANT_TEXT,
    },
  ],
});
