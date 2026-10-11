import { defineCard } from "../define.js";

// EDHREC rank 6754.
const PUMP_TEXT = "Adelbert Steiner gets +1/+1 for each Equipment you control.";

export default defineCard({
  name: "Adelbert Steiner",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 1,
  keywords: ["lifelink"],
  text: `Lifelink\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
});
