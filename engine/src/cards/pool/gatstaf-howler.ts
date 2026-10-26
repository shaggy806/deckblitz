import { defineCard } from "../define.js";

export default defineCard({
  name: "Gatstaf Howler",
  art: "https://cards.scryfall.io/art_crop/back/5/7/57f0907f-74f4-4d86-93df-f2e50c9d0b2f.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 3,
  keywords: ["intimidate"],
  text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
  faces: ["Gatstaf Shepherd", "Gatstaf Howler"],
  transform: true,
});
