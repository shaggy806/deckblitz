import { defineCard } from "../define.js";


export default defineCard({
  name: "Gatstaf Ravagers",
  art: "https://cards.scryfall.io/art_crop/back/6/a/6ab67098-d3d5-4799-ae03-c734244f370e.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 6,
  toughness: 5,
  keywords: ["menace"],
  text: "Menace (This creature can't be blocked except by two or more creatures.)\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
  faces: ["Gatstaf Arsonists", "Gatstaf Ravagers"],
  transform: true,
});
