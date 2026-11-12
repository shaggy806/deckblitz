import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11102.

const PUMP_TEXT = "Equipped creature gets +2/+0.";
const TURN_TEXT = "During your turn, creatures you control that are equipped have first strike and vigilance.";

export default defineCard({
  name: "Long-Lost Lances",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PUMP_TEXT}\n${TURN_TEXT}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [
    { affects: { scope: "attached" }, grantPt: [2, 0], text: PUMP_TEXT },
    {
      affects: { scope: "filter", filter: { type: "creature", controlledBy: "you", equipped: true } },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike", "vigilance"],
      text: TURN_TEXT,
    },
  ],
});
