import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 17736.
//
// Simian Sling's equipped half: once per blocking, however many blockers
// (the ruling), dealt by the equipped creature.
const BLOCKED_TEXT = "Whenever equipped creature becomes blocked, it deals 1 damage to defending player.";

export default defineCard({
  name: "Tormentor's Helm",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${BLOCKED_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "trigger-player", from: "trigger-object" },
      resolve: null,
      text: BLOCKED_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
