import { defineCard } from "../define.js";

// Fifth Dawn. EDHREC rank 27158.
//
// `blockAdditionalPer`: one more creature it can block for each Equipment
// attached to it, counted as blockers are declared (its ruling).

const TEXT = "This creature can block an additional creature each combat for each Equipment attached to this creature.";

export default defineCard({
  name: "Kemba's Legion",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Soldier"],
  power: 4,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      blockAdditionalPer: { subtype: "Equipment", attachedTo: { isSource: true } },
      text: TEXT,
    },
  ],
});
