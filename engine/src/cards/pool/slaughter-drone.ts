import { defineCard } from "../define.js";

export default defineCard({
  name: "Slaughter Drone",
  manaCost: "{1}{B}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 2,
  toughness: 2,
  text: "Devoid (This card has no color.)\n{C}: This creature gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it. {C} represents colorless mana.)",
  activated: [
    {
      cost: { mana: "{C}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "deathtouch",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{C}: This creature gains deathtouch until end of turn.",
    },
  ],
});
