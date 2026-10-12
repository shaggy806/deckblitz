import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 18568.
const MAX_TEXT = "Max speed — This creature gets +1/+2.";

export default defineCard({
  name: "Walking Sarcophagus",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Zombie", "Cat"],
  power: 2,
  toughness: 1,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${MAX_TEXT}`,
  static: [maxSpeed({ grantPt: [1, 2], text: MAX_TEXT })],
});
