import { defineCard } from "../define.js";

// Back face of Mondronen Shaman.

export default defineCard({
  name: "Tovolar's Magehunter",
  art: "https://cards.scryfall.io/art_crop/back/b/1/b150d71f-11c9-40d6-a461-4967ef437315.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  text: "Whenever an opponent casts a spell, this creature deals 2 damage to that player.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: "Whenever an opponent casts a spell, this creature deals 2 damage to that player.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "At the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
      condition: { kind: "spells-cast-last-turn", byOnePlayerAtLeast: 2 },
    },
  ],
  faces: ["Mondronen Shaman", "Tovolar's Magehunter"],
  transform: true,
});
