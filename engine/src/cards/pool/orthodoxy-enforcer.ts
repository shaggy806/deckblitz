import { defineCard } from "../define.js";

// EDHREC rank 24154.

const PUMP_TEXT = "This creature gets +2/+0 as long as you control two or more artifacts.";

export default defineCard({
  name: "Orthodoxy Enforcer",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Cleric"],
  power: 2,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${PUMP_TEXT}`,
  static: [
    {
      // Counts itself should it become an artifact (Gaelicat's shape).
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 2, countsSelf: true },
      grantPt: [2, 0],
      text: PUMP_TEXT,
    },
  ],
});
