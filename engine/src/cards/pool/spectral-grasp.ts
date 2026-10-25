import { defineCard } from "../define.js";

// EDHREC rank 15759.
//
// "You" is the Aura's controller (Vow of Duty's shape). "Can't block
// creatures you control" is "can block only creatures you don't control":
// `canBlockOnly` matches the attacker from the Aura's controller's side, so
// `controlledBy: "opponent"` is any attacker its controller doesn't control.

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
