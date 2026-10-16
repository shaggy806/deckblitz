import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 19080.

const ENTERS = "When this Equipment enters, attach it to target creature you control.";
const ATTACKS = "Whenever equipped creature attacks, tap up to one target creature.";

export default defineCard({
  name: "Baseball Bat",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\nEquipped creature gets +1/+1.\n${ATTACKS}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: ATTACKS,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  activated: [equip("{3}")],
});
