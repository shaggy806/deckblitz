import { defineCard } from "../define.js";

const TEXT = "Discard a card: Draw a card. Activate only as a sorcery and only once each turn.";

export default defineCard({
  name: "Thunderhead Gunner",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shark", "Pirate"],
  power: 4,
  toughness: 5,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
      oncePerTurn: true,
    },
  ],
});
