import { defineCard } from "../define.js";

// "Destroy that permanent" reaches it whoever controls it now, unlike a
// sacrifice; one that has left is gone already.
const PUMP_TEXT = "Equipped creature gets +2/+0, has menace, and is a Pirate in addition to its other creature types.";
const DESTROY_TEXT = "Whenever this Equipment becomes unattached from a permanent, destroy that permanent.";

export default defineCard({
  name: "Captain's Hook",
  manaCost: "{3}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${DESTROY_TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantKeywords: ["menace"],
      addSubtypes: ["Pirate"],
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-unattached", who: "self" },
      targets: [],
      effect: { kind: "destroy", target: "trigger-object" },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
