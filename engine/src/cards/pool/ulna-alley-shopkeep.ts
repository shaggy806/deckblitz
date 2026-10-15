import { defineCard } from "../define.js";

// EDHREC rank 25401. Secrets of Strixhaven.
const INFUSION_TEXT = "Infusion — This creature gets +2/+0 as long as you gained life this turn.";

export default defineCard({
  name: "Ulna Alley Shopkeep",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Goblin", "Warlock"],
  power: 2,
  toughness: 3,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${INFUSION_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      grantPt: [2, 0],
      text: INFUSION_TEXT,
    },
  ],
});
