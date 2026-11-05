import { equip } from "../helpers.js";
import { defineCard } from "../define.js";

const TAP = "Whenever this Equipment becomes attached to a creature, tap that creature.";

export default defineCard({
  name: "Enormous Energy Blade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +4/+0.\n${TAP}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [equip("{2}")],
  triggered: [
    {
      trigger: { on: "becomes-attached", who: "self", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "tap", target: "trigger-object" },
      resolve: null,
      text: TAP,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [4, 0], text: "Equipped creature gets +4/+0." }],
});
