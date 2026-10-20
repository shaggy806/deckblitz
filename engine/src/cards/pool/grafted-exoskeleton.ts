import { defineCard } from "../define.js";

// "Becomes unattached" covers moving it to another creature, the creature or
// this leaving the battlefield (this leaving reads what it was on as it last
// existed — rule 603.10a), and any other way it stops being attached. Its
// controller sacrifices "that permanent" only while they control it (701.21a);
// one that has left is gone already.
const PUMP_TEXT = "Equipped creature gets +2/+2 and has infect.";
const SACRIFICE_TEXT = "Whenever this Equipment becomes unattached from a permanent, sacrifice that permanent.";

export default defineCard({
  name: "Grafted Exoskeleton",
  manaCost: "{4}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT} (It deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n${SACRIFICE_TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["infect"],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
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
