import { defineCard } from "../define.js";


export default defineCard({
  name: "Lone Wolf of the Natterknolls",
  art: "https://cards.scryfall.io/art_crop/back/d/5/d5e84d80-b5a6-4cd1-9f31-f6ca46bf2c0c.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 5,
  text: "Whenever an opponent casts a spell during your turn, draw two cards.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      condition: { kind: "your-turn" },
      targets: [],
      effect: { kind: "draw", amount: 2 },
      resolve: null,
      text: "Whenever an opponent casts a spell during your turn, draw two cards.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Hermit of the Natterknolls", "Lone Wolf of the Natterknolls"],
  transform: true,
});
