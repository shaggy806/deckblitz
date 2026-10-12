import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 21899.
const MAX_TEXT = "Max speed — This creature has lifelink.";

export default defineCard({
  name: "Streaking Oilgorger",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "haste", "start-your-engines"],
  text: `Flying, haste\n${START_YOUR_ENGINES_TEXT}\n${MAX_TEXT}`,
  static: [maxSpeed({ grantKeywords: ["lifelink"], text: MAX_TEXT })],
});
