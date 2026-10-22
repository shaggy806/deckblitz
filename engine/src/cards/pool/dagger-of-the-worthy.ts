import { defineCard } from "../define.js";
import { afflict } from "../helpers.js";

// EDHREC rank 24967.
//
// Afflict 1 granted to the equipped creature (rule 702.130 — a triggered ability, Lazotep
// Sliver's `grantsTriggered` shape). Each instance of afflict triggers separately.

export default defineCard({
  name: "Dagger of the Worthy",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +2/+0 and has afflict 1. (Whenever it becomes blocked, defending player loses 1 life.)\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsTriggered: [afflict(1)],
      text: "Equipped creature gets +2/+0 and has afflict 1.",
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
