import { defineCard } from "../define.js";

const TEXT = "{T}: This creature deals 2 damage to any target chosen at random.";

export default defineCard({
  name: "Goblin Test Pilot",
  manaCost: "{1}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Goblin", "Pilot", "Wizard"],
  power: 0,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      targetsAtRandom: true,
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
