import { defineCard } from "../define.js";

export default defineCard({
  name: "Spiteflame Witch",
  manaCost: "{1}{B/R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 1,
  text: "{B}{R}: Each player loses 1 life.",
  activated: [
    {
      cost: { mana: "{B}{R}", tap: false },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-player" },
      resolve: null,
      text: "{B}{R}: Each player loses 1 life.",
    },
  ],
});
