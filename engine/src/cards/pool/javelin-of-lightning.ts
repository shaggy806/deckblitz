import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings:
//   [2022-06-10] Javelin of Lightning doesn't enter the battlefield attached to a creature.
//     Instead, the Equipment enters the battlefield and then a triggered ability attaches it to a
//     creature. You may cast Javelin of Lightning even if you don't control any creatures.
//   [2022-06-10] Attaching an Equipment with its enters-the-battlefield triggered ability isn't
//     the same as using its equip ability. You don't pay mana for the attachment, and the timing
//     restrictions for equip abilities don't apply.
//   [2022-06-10] If the target creature becomes an illegal target, the Equipment remains on the
//     battlefield unattached.

const ENTER_TEXT = "When this Equipment enters, attach it to target creature you control.";
const EQUIPPED_TEXT = "During your turn, equipped creature gets +2/+0 and has first strike.";

export default defineCard({
  name: "Javelin of Lightning",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${EQUIPPED_TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantPt: [2, 0],
      grantKeywords: ["first-strike"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
