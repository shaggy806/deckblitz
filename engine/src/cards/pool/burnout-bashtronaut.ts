import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 10091.
const PUMP_TEXT = "{2}: This creature gets +1/+0 until end of turn.";
const MAX_TEXT = "Max speed — This creature has double strike.";

export default defineCard({
  name: "Burnout Bashtronaut",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Warrior"],
  power: 1,
  toughness: 1,
  keywords: ["menace", "start-your-engines"],
  text: `Menace\n${START_YOUR_ENGINES_TEXT}\n${PUMP_TEXT}\n${MAX_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  static: [maxSpeed({ grantKeywords: ["double-strike"], text: MAX_TEXT })],
});
