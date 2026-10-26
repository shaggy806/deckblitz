import { defineCard } from "../define.js";

export default defineCard({
  name: "Howlpack of Estwald",
  art: "https://cards.scryfall.io/art_crop/back/3/1/319b65f6-a6e6-45ea-9837-bc5831f54205.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 6,
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
  faces: ["Villagers of Estwald", "Howlpack of Estwald"],
  transform: true,
});
