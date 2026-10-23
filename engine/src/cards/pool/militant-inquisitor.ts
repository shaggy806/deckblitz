import { defineCard } from "../define.js";

const TEXT = "This creature gets +1/+0 for each Equipment you control.";

// Every Equipment you control counts, attached or not (the ruling).
export default defineCard({
  name: "Militant Inquisitor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { subtype: "Equipment", controlledBy: "you" }, pt: [1, 0] },
      text: TEXT,
    },
  ],
});
