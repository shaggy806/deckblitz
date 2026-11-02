import { defineCard } from "../define.js";

// Rules 508.1c and 509.1b, on everyone's attacks and blocks. The two blocks are
// counted over every defending player.
const ATTACK_TEXT = "No more than two creatures can attack each combat.";
const BLOCK_TEXT = "No more than two creatures can block each combat.";

export default defineCard({
  name: "Caverns of Despair",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  supertypes: ["world"],
  types: ["enchantment"],
  text: `${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, attackLimit: { most: 2, covers: "all" }, text: ATTACK_TEXT },
    { affects: { scope: "self" }, blockLimit: { most: 2 }, text: BLOCK_TEXT },
  ],
});
