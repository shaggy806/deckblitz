import { defineCard } from "../define.js";


export default defineCard({
  name: "One of the Pack",
  art: "https://cards.scryfall.io/art_crop/back/6/c/6c200ef1-ea08-48d4-ab50-77940a0e08c3.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 6,
  text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Solitary Hunter", "One of the Pack"],
  transform: true,
});
