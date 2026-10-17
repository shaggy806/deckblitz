import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9547.
//
// Hero's Heirloom's shape: the menace static is gated on the Equipment's host
// being legendary as it is now.

export default defineCard({
  name: "Gimli's Axe",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +3/+0.\nAs long as equipped creature is legendary, it has menace. (It can't be blocked except by two or more creatures.)\nEquip {2}",
  activated: [equip("{2}")],
  static: [
    { affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." },
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { supertype: "legendary" } } },
      grantKeywords: ["menace"],
      text: "As long as equipped creature is legendary, it has menace.",
    },
  ],
});
