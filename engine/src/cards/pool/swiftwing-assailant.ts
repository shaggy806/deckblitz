import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 24355.
const MAX_TEXT = "Max speed — This creature gets +0/+1 and has vigilance.";

export default defineCard({
  name: "Swiftwing Assailant",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["flying", "start-your-engines"],
  text: `Flying\n${START_YOUR_ENGINES_TEXT}\n${MAX_TEXT}`,
  static: [maxSpeed({ grantPt: [0, 1], grantKeywords: ["vigilance"], text: MAX_TEXT })],
});
