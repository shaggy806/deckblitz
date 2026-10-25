import { defineCard } from "../define.js";


export default defineCard({
  name: "Timber Shredder",
  art: "https://cards.scryfall.io/art_crop/back/3/4/34898af1-ebe6-4ede-81be-23fd62844480.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 2,
  keywords: ["trample"],
  text: "Trample\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
  faces: ["Hinterland Logger", "Timber Shredder"],
  transform: true,
});
