import { defineCard } from "../define.js";

// "It doesn't untap" alone (`onlyDoesntUntap`) — an attacker with vigilance
// stays untapped now but skips its next untap all the same. "Becomes
// unattached" is Grafted Exoskeleton's trigger.
const PUMP_TEXT = "Equipped creature gets +3/+3.";
const ATTACK_TEXT = "Whenever equipped creature attacks, it doesn't untap during its controller's next untap step.";
const SACRIFICE_TEXT = "Whenever this Equipment becomes unattached from a permanent, sacrifice that permanent.";

export default defineCard({
  name: "Stitcher's Graft",
  manaCost: "{1}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${ATTACK_TEXT}\n${SACRIFICE_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "tap", target: "trigger-object", doesntUntapNext: true, onlyDoesntUntap: true },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "becomes-unattached", who: "self" },
      targets: [],
      effect: { kind: "sacrifice-target", target: "trigger-object" },
      resolve: null,
      text: SACRIFICE_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
