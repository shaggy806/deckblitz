import { defineCard } from "../define.js";

// As Grafted Exoskeleton: re-equipping, either leaving, or any other unattach
// sacrifices what it was on, while its controller controls that.
const PUMP_TEXT = "Equipped creature gets +3/+2.";
const SACRIFICE_TEXT = "Whenever this Equipment becomes unattached from a permanent, sacrifice that permanent.";

export default defineCard({
  name: "Grafted Wargear",
  manaCost: "{3}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${SACRIFICE_TEXT}\nEquip {0} ({0}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 2],
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
      cost: { mana: "{0}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {0}",
      sorcerySpeed: true,
    },
  ],
});
