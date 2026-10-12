import { defineCard } from "../define.js";

export default defineCard({
  name: "Prophet of Distortion",
  manaCost: "{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 2,
  text: "Devoid (This card has no color.)\n{3}{C}: Draw a card. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{3}{C}", tap: false },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{3}{C}: Draw a card.",
    },
  ],
});
