import { defineCard } from "../define.js";


export default defineCard({
  name: "Werewolf of Ancient Hunger",
  art: "https://cards.scryfall.io/art_crop/back/9/4/94c5f7fe-9ca6-4040-bf7c-062ab22e6a02.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance", "trample"],
  text: "Vigilance, trample\nWerewolf of Ancient Hunger's power and toughness are each equal to the total number of cards in all players' hands.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: "cards-in-all-hands", plusPower: 0, plusToughness: 0 },
      text: "Werewolf of Ancient Hunger's power and toughness are each equal to the total number of cards in all players' hands.",
    },
  ],
  faces: ["Sage of Ancient Lore", "Werewolf of Ancient Hunger"],
  transform: true,
});
