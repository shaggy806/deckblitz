import { defineCard } from "../define.js";

// "Transformed permanents" are double-faced permanents with their back face
// up (rule 701.27g) — melded and merged ones never are (`transformed`).

const PUMP_TEXT = "This creature gets +1/+0 for each transformed permanent you control.";

export default defineCard({
  name: "Mutagen Connoisseur",
  manaCost: "{1}{G}{U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Mutant"],
  power: 0,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { filter: { transformed: true, controlledBy: "you" }, pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
});
