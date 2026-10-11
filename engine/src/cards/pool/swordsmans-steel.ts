import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8529. Both counts are of the Equipment its controller controls
// — itself included — read as the trigger resolves (Tishana's draw) and live
// for the bonus (Horn of Valhalla's `grantPtPerCount`).

const ENTER_TEXT = "When this Equipment enters, draw a card for each Equipment you control.";
const STATIC_TEXT = "Equipped creature gets +2/+2 for each Equipment you control.";

export default defineCard({
  name: "Swordsman's Steel",
  manaCost: "{4}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTER_TEXT}\n${STATIC_TEXT}\nEquip {3}`,
  activated: [equip("{3}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { subtype: "Equipment", controlledBy: "you" } } },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Equipment", controlledBy: "you" }, pt: [2, 2] },
      text: STATIC_TEXT,
    },
  ],
});
