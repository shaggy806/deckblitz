import { defineCard } from "../define.js";
import { equip, VOID_CONDITION } from "../helpers.js";

// EDHREC rank 15796.
const PUMP_TEXT = "Equipped creature gets +3/+1.";
const VOID_TEXT =
  "Void — At the beginning of your end step, if a nonland permanent left the battlefield this turn or a spell was warped this turn, attach this Equipment to target creature you control.";

export default defineCard({
  name: "Hylderblade",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${VOID_TEXT}\nEquip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [3, 1], text: PUMP_TEXT }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["creature-you-control"],
      condition: VOID_CONDITION,
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: VOID_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
