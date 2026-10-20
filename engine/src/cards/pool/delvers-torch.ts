import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 13444.
const ATTACK_TEXT =
  "Whenever equipped creature attacks, venture into the dungeon. (Enter the first room or advance to the next room.)";

export default defineCard({
  name: "Delver's Torch",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+1.\n${ATTACK_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
