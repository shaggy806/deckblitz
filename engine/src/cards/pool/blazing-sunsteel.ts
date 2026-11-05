import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The equipped creature is the source of the damage (the ruling), so the
// damage comes `from` the trigger's object; opponents who have left aren't
// counted.

const PT_TEXT = "Equipped creature gets +1/+0 for each opponent you have.";
const DAMAGE_TEXT = "Whenever equipped creature is dealt damage, it deals that much damage to any target.";

export default defineCard({
  name: "Blazing Sunsteel",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PT_TEXT}\n${DAMAGE_TEXT}\nEquip {4}`,
  static: [{ affects: { scope: "attached" }, grantPtPerCount: { opponents: true, pt: [1, 0] }, text: PT_TEXT }],
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "attached" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0, from: "trigger-object" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
