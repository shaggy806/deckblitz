import { defineCard } from "../define.js";

// EDHREC rank 7551.
const HEXPROOF_TEXT = "You have hexproof. (You can't be the target of spells or abilities your opponents control.)";

export default defineCard({
  name: "Aegis of the Gods",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 1,
  text: HEXPROOF_TEXT,
  static: [{ affects: { scope: "self" }, playerHexproof: true, text: HEXPROOF_TEXT }],
});
