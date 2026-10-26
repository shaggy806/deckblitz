import { defineCard } from "../define.js";

export default defineCard({
  name: "Rampaging Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/6/1/6151cae7-92a4-4891-a952-21def412d3e4.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 4,
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
  faces: ["Tormented Pariah", "Rampaging Werewolf"],
  transform: true,
});
