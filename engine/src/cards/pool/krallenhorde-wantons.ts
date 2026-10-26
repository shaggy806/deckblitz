import { defineCard } from "../define.js";

export default defineCard({
  name: "Krallenhorde Wantons",
  art: "https://cards.scryfall.io/art_crop/back/4/b/4b43b0cb-a5a3-47b4-9b6b-9d2638222bb6.jpg",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 7,
  toughness: 7,
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
  faces: ["Grizzled Outcasts", "Krallenhorde Wantons"],
  transform: true,
});
