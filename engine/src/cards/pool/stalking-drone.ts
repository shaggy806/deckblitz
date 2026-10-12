import { defineCard } from "../define.js";

export default defineCard({
  name: "Stalking Drone",
  manaCost: "{1}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: "Devoid (This card has no color.)\n{C}: This creature gets +1/+2 until end of turn. Activate only once each turn. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{C}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: "{C}: This creature gets +1/+2 until end of turn. Activate only once each turn.",
      oncePerTurn: true,
    },
  ],
});
