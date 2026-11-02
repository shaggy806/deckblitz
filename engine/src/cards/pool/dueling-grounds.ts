import { defineCard } from "../define.js";

// Rules 508.1c and 509.1b. An attacker that needs more than one blocker (menace)
// can't be blocked at all while this is out.
const ATTACK_TEXT = "No more than one creature can attack each combat.";
const BLOCK_TEXT = "No more than one creature can block each combat.";

export default defineCard({
  name: "Dueling Grounds",
  manaCost: "{1}{G}{W}",
  colors: ["G", "W"],
  types: ["enchantment"],
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, attackLimit: { most: 1, covers: "all" }, text: ATTACK_TEXT },
    { affects: { scope: "self" }, blockLimit: { most: 1 }, text: BLOCK_TEXT },
  ],
});
