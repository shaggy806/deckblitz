import { defineCard } from "../define.js";

const TEXT = "Whenever another colorless creature you control enters, target opponent loses 1 life.";

export default defineCard({
  name: "Flayer Drone",
  manaCost: "{1}{B}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike"],
  text: `Devoid (This card has no color.)\nFirst strike\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { type: "creature", colorless: true },
      },
      targets: ["opponent"],
      effect: { kind: "lose-life", amount: 1, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
