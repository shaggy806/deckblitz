import { defineCard } from "../define.js";

export default defineCard({
  name: "Ironfang",
  art: "https://cards.scryfall.io/art_crop/back/c/d/cd5435d0-789f-4c42-8efc-165c072404a2.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 3,
  toughness: 1,
  keywords: ["first-strike"],
  text: "First strike\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
  faces: ["Village Ironsmith", "Ironfang"],
  transform: true,
});
