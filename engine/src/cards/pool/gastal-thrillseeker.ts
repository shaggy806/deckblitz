import { defineCard } from "../define.js";
import { maxSpeed, START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 14807.
const ENTERS_TEXT = "When this creature enters, it deals 1 damage to target opponent and you gain 1 life.";
const MAX_TEXT = "Max speed — This creature has deathtouch and haste.";

export default defineCard({
  name: "Gastal Thrillseeker",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Lizard", "Berserker"],
  power: 2,
  toughness: 3,
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${ENTERS_TEXT}\n${MAX_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "gain-life", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [maxSpeed({ grantKeywords: ["deathtouch", "haste"], text: MAX_TEXT })],
});
