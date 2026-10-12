import { defineCard } from "../define.js";

export default defineCard({
  name: "Blinding Drone",
  manaCost: "{1}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 1,
  toughness: 3,
  text: "Devoid (This card has no color.)\n{C}, {T}: Tap target creature. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{C}", tap: true },
      targets: ["creature"],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: "{C}, {T}: Tap target creature.",
    },
  ],
});
