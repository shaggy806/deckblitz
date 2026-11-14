import { defineCard } from "../define.js";

// EDHREC rank 10495.
//
// Rulings:
//   The timestamp of the control-changing effect is the time this Aura entered (attached) and
//     doesn't change when another player becomes the monarch (rule 613.7e): a newer control
//     effect outlasts a change of monarch.
//   With no monarch, the effect does nothing until there is one.
//   If the monarch leaves the game, the next monarch gains control of the creature; if they
//     own this Aura, it leaves with them and control reverts.
//
// "You" of "can't attack you" is this Aura's controller, read as the attack is declared.
const ENTER_TEXT = "When this Aura enters, you become the monarch.";
const CONTROL_TEXT = "The monarch controls enchanted creature.";
const ATTACK_TEXT = "Enchanted creature attacks each combat if able and can't attack you.";

export default defineCard({
  name: "Fealty to the Realm",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${CONTROL_TEXT}\n${ATTACK_TEXT}`,
  targets: ["creature"],
  controlEnchanted: "monarch",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      restrictions: ["must-attack", { kind: "cant-attack", at: "you" }],
      text: ATTACK_TEXT,
    },
  ],
});
