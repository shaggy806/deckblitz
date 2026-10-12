import { defineCard } from "../define.js";

export default defineCard({
  name: "Maw of Kozilek",
  manaCost: "{3}{R}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 5,
  text: "Devoid (This card has no color.)\n{C}: This creature gets +2/-2 until end of turn. ({C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{C}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: -2, duration: "end-of-turn" },
      resolve: null,
      text: "{C}: This creature gets +2/-2 until end of turn.",
    },
  ],
});
