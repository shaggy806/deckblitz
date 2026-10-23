import { defineCard } from "../define.js";


export default defineCard({
  name: "Branded Howler",
  art: "https://cards.scryfall.io/art_crop/back/f/4/f43f5f02-1b29-4e75-a6af-378dcc88c3df.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
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
  faces: ["Convicted Killer", "Branded Howler"],
  transform: true,
});
