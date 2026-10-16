import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 20750. A Clue Equipment (Clue is an artifact type). "Whenever
// equipped creature dies" is Heirloom Blade's `who: "attached"` trigger: the
// creature this Equipment was attached to as it died.

const DIES_TEXT = "Whenever equipped creature dies, each opponent loses 1 life.";

export default defineCard({
  name: "Lead Pipe",
  manaCost: "{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Clue", "Equipment"],
  text: `Equipped creature gets +2/+0.\n${DIES_TEXT}\n{2}, Sacrifice this Equipment: Draw a card.\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Equipped creature gets +2/+0." }],
  triggered: [
    {
      trigger: { on: "dies", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{2}, Sacrifice this Equipment: Draw a card.",
    },
    equip("{2}"),
  ],
});
