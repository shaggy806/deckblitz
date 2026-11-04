import { defineCard } from "../define.js";

// Urza's Saga. See Ali from Cairo, while you control a creature.
const TEXT = "If you control a creature, damage that would reduce your life total to less than 1 reduces it to 1 instead.";

export default defineCard({
  name: "Worship",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1, countsSelf: true },
      damageLifeFloor: 1,
      text: TEXT,
    },
  ],
});
