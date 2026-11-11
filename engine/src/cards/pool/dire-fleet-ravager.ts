import { defineCard } from "../define.js";

const TEXT = "When this creature enters, each player loses a third of their life, rounded up.";

export default defineCard({
  name: "Dire Fleet Ravager",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate", "Wizard"],
  power: 4,
  toughness: 4,
  keywords: ["menace", "deathtouch"],
  text: `Menace, deathtouch\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "lose-life",
        who: "each-player",
        amount: { half: { lifeTotal: "each" }, round: "up", fraction: 3 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
