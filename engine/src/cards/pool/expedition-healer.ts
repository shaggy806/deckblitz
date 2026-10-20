import { defineCard } from "../define.js";

// EDHREC rank 26199.

const LIFELINK_TEXT = "This creature has lifelink as long as you control another Cleric.";

export default defineCard({
  name: "Expedition Healer",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${LIFELINK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Cleric" }, atLeast: 1, excludeSelf: true },
      grantKeywords: ["lifelink"],
      text: LIFELINK_TEXT,
    },
  ],
});
