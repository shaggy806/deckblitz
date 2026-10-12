import { defineCard } from "../define.js";

export default defineCard({
  name: "Havoc Sower",
  manaCost: "{3}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  text: "Devoid (This card has no color.)\n{1}{C}: This creature gets +2/+1 until end of turn. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{1}{C}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{C}: This creature gets +2/+1 until end of turn.",
    },
  ],
});
