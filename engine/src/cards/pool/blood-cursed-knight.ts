import { defineCard } from "../define.js";

// Magic Origins. EDHREC rank 22937.
//
// Rulings:
//   [2015-06-22] An Aura you control enchanting an opponent's creature still counts.
//
// Shinechaser's condition: an enchantment you control, wherever it's attached.
const TEXT =
  "As long as you control an enchantment, this creature gets +1/+1 and has lifelink.";

export default defineCard({
  name: "Blood-Cursed Knight",
  manaCost: "{1}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 3,
  toughness: 2,
  text: `${TEXT} (Damage dealt by this creature also causes you to gain that much life.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1, countsSelf: true },
      grantPt: [1, 1],
      grantKeywords: ["lifelink"],
      text: TEXT,
    },
  ],
});
