import { defineCard } from "../define.js";

// "Can't be the target of black or red spells your opponents control" is
// hexproof from black and red for spells only — abilities from black or red
// sources still can (rules 601.2c, 702.11d): `hexproofFrom` with `spellsOnly`.
const TARGET_TEXT = "This creature can't be the target of black or red spells your opponents control.";

export default defineCard({
  name: "Fiendslayer Paladin",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike", "lifelink"],
  text: `First strike\nLifelink\n${TARGET_TEXT}`,
  static: [{ affects: { scope: "self" }, hexproofFrom: { colors: ["B", "R"], spellsOnly: true, notHexproof: true }, text: TARGET_TEXT }],
});
