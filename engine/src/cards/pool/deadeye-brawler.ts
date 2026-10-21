import { defineCard } from "../define.js";

// EDHREC rank 20140.

export default defineCard({
  name: "Deadeye Brawler",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 2,
  toughness: 4,
  keywords: ["deathtouch", "ascend"],
  text: "Deathtouch\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nWhenever this creature deals combat damage to a player, if you have the city's blessing, draw a card.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, if you have the city's blessing, draw a card.",
      condition: { kind: "citys-blessing" },
    },
  ],
});
