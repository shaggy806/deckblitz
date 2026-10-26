import { defineCard } from "../define.js";

// The back face of Scorned Villager.

export default defineCard({
  name: "Moonscarred Werewolf",
  art: "https://cards.scryfall.io/art_crop/back/e/e/ee539a5e-2d10-4666-9b52-5064562dd233.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\n{T}: Add {G}{G}.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: "{T}: Add {G}{G}.",
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
  faces: ["Scorned Villager", "Moonscarred Werewolf"],
  transform: true,
});
