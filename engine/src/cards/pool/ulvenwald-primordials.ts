import { defineCard } from "../define.js";

export default defineCard({
  name: "Ulvenwald Primordials",
  art: "https://cards.scryfall.io/art_crop/back/8/3/8325c570-4d74-4e65-891c-3e153abf4bf9.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  text: "{G}: Regenerate this creature.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{G}: Regenerate this creature.",
    },
  ],
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
  faces: ["Ulvenwald Mystics", "Ulvenwald Primordials"],
  transform: true,
});
