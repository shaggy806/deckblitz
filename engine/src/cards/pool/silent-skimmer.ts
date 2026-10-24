import { defineCard } from "../define.js";

// EDHREC rank 25799. Devoid: no colors.

const TEXT = "Whenever this creature attacks, defending player loses 2 life.";

export default defineCard({
  name: "Silent Skimmer",
  manaCost: "{3}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 0,
  toughness: 4,
  keywords: ["flying"],
  text: `Devoid (This card has no color.)\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-player", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
