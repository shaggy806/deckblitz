import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20640.
//
// Rulings:
//   [2022-06-10] Reducing a creature's power after it has blocked a creature equipped with Saddle
//     of the Cavalier will not remove that blocking creature from combat or make the equipped
//     creature unblocked.

const STATIC_TEXT = "Equipped creature gets +3/+3 and can't be blocked by creatures with power 3 or less.";

export default defineCard({
  name: "Saddle of the Cavalier",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {3}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 3],
      cantBeBlockedBy: { power: { op: "lte", n: 3 } },
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
