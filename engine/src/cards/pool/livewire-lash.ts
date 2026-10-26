import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const GRANTED = "Whenever this creature becomes the target of a spell, this creature deals 2 damage to any target.";

// The granted trigger is the creature's own: it is the source of the damage,
// not the Equipment (the ruling).
export default defineCard({
  name: "Livewire Lash",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+0 and has "${GRANTED}"\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsTriggered: [
        {
          trigger: { on: "becomes-target", who: "self", spellOnly: true, targeterNotTarget: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: `Equipped creature gets +2/+0 and has "${GRANTED}"`,
    },
  ],
  activated: [equip("{2}")],
});
