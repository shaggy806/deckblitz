import { defineCard } from "../define.js";

const PUMP_TEXT = "This creature gets +2/+0 for each Equipment attached to it.";

export default defineCard({
  name: "Goblin Gaveleer",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["trample"],
  text: `Trample\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", attachedTo: { isSource: true } }, pt: [2, 0] },
      text: PUMP_TEXT,
    },
  ],
});
