import { defineCard } from "../define.js";


export default defineCard({
  name: "Lambholt Butcher",
  art: "https://cards.scryfall.io/art_crop/back/2/3/23f3fa96-6276-463e-8033-a64c8f06c933.jpg",
  colors: ["G"],
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
  faces: ["Lambholt Pacifist", "Lambholt Butcher"],
  transform: true,
});
