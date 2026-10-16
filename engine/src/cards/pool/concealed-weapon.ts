import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 21887.
//
// Rulings:
//   [2024-02-02] If the target creature becomes an illegal target, Concealed Weapon remains on
//     the battlefield unattached.
//   [2024-02-02] You may turn Concealed Weapon face up even if you don't control any creatures.
//   [2024-02-02] Attaching Concealed Weapon with its triggered ability isn't the same as using its
//     equip ability. You don't pay mana for the attachment, and the timing restrictions for equip
//     abilities don't apply.
//
// Cast face down it's a 2/2 creature with ward {2}; turned face up it's this
// Equipment, no longer a creature, and its trigger attaches it (the `attach`
// effect, not the equip ability — no cost, no sorcery timing). With no
// creature to target the trigger is simply removed.

const DISGUISE =
  "Disguise {2}{R} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT = "When this Equipment is turned face up, attach it to target creature you control.";

export default defineCard({
  name: "Concealed Weapon",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+0.\n${DISGUISE}\n${FACE_UP_TEXT}\nEquip {1}{R}`,
  morph: { keyword: "disguise", cost: "{2}{R}" },
  static: [{ affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." }],
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
  activated: [equip("{1}{R}")],
});
