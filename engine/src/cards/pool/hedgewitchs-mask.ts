import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 14783.
//
// Rulings:
//   [2021-09-24] The blocking restriction is applied only when blockers are declared. Once a
//     creature equipped with Hedgewitch's Mask becomes blocked by a creature with power less than
//     4, increasing that creature's power won't cause the equipped creature to become unblocked.

export default defineCard({
  name: "Hedgewitch's Mask",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+1.\nEquipped creature can't be blocked by creatures with power 4 or greater.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  static: [
    { affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." },
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { power: { op: "gte", n: 4 } },
      text: "Equipped creature can't be blocked by creatures with power 4 or greater.",
    },
  ],
  activated: [equip("{2}")],
});
