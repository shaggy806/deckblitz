import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 9873.
const DIES_TEXT = "When this creature dies, create a 1/1 colorless Servo artifact creature token.";
const MAX_TEXT = "Max speed — This creature gets +1/+0.";

export default defineCard({
  name: "Nesting Bot",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 1,
  toughness: 1,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${DIES_TEXT}\n${MAX_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  static: [maxSpeed({ grantPt: [1, 0], text: MAX_TEXT })],
});
