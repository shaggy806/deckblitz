import { defineCard } from "../define.js";

// EDHREC rank 15759.
//
// "You" is this Aura's controller in both statics: `cantAttackController`
// reads it (Vow of Duty), and `canBlockOnly`'s attacker is matched from the
// Aura controller's side, so "can't block creatures you control" is "can
// block only creatures controlled by someone else".

const ATTACK_TEXT = "Enchanted creature can't attack you or planeswalkers you control.";
const BLOCK_TEXT = "Enchanted creature can't block creatures you control.";

export default defineCard({
  name: "Spectral Grasp",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK_TEXT}\n${BLOCK_TEXT}`,
  targets: ["creature"],
  static: [
    { affects: { scope: "attached" }, cantAttackController: true, text: ATTACK_TEXT },
    { affects: { scope: "attached" }, canBlockOnly: { controlledBy: "opponent" }, text: BLOCK_TEXT },
  ],
});
