import { defineCard } from "../define.js";

// "Can't be the target of nongreen spells your opponents control or
// abilities from nongreen sources your opponents control" is hexproof from
// nongreen in all but name (rule 702.11d): `hexproofFrom` with a filter.

const TARGET_TEXT =
  "Thrun can't be the target of nongreen spells your opponents control or abilities from nongreen sources your opponents control.";
const TURN_TEXT = "During your turn, Thrun has indestructible.";

export default defineCard({
  name: "Thrun, Breaker of Silence",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Troll", "Shaman"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  cantBeCountered: true,
  text: `This spell can't be countered.\nTrample\n${TARGET_TEXT}\n${TURN_TEXT}`,
  static: [
    { affects: { scope: "self" }, hexproofFrom: { filter: { notColors: ["G"] } }, text: TARGET_TEXT },
    { affects: { scope: "self" }, condition: { kind: "your-turn" }, grantKeywords: ["indestructible"], text: TURN_TEXT },
  ],
});
