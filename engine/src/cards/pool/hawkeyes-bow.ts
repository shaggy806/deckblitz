import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const PING_TEXT = "Whenever equipped creature becomes tapped, it deals 1 damage to each opponent.";

// Fiendlash's "it deals": the equipped creature is the trigger object and the
// damage's source.
export default defineCard({
  name: "Hawkeye's Bow",
  manaCost: "{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `Equipped creature gets +1/+0 and has reach.\n${PING_TEXT}\n` +
    "Equip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["reach"],
      text: "Equipped creature gets +1/+0 and has reach.",
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "attached" },
      targets: [],
      effect: { kind: "damage", amount: 1, who: "each-opponent", from: "trigger-object" },
      resolve: null,
      text: PING_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
