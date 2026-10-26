import { defineCard } from "../define.js";

export default defineCard({
  name: "Bane of Hanweir",
  art: "https://cards.scryfall.io/art_crop/back/d/0/d067706b-e2cc-4ad5-b992-28222a8af4ad.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 5,
  toughness: 5,
  text: "This creature attacks each combat if able.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
      restrictions: ["must-attack"],
      text: "This creature attacks each combat if able.",
    },
  ],
  faces: ["Hanweir Watchkeep", "Bane of Hanweir"],
  transform: true,
});
