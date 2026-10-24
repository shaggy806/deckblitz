import { defineCard } from "../define.js";


export default defineCard({
  name: "Neck Breaker",
  art: "https://cards.scryfall.io/art_crop/back/f/e/fe9f85e8-1e4c-4478-8344-71fae357b694.jpg",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Werewolf"],
  power: 4,
  toughness: 3,
  text: "Attacking creatures you control get +1/+0 and have trample.\nAt the beginning of each upkeep, if a player cast two or more spells last turn, transform this creature.",
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
      affects: { scope: "filter", filter: { type: "creature", attacking: true, controlledBy: "you" } },
      grantPt: [1, 0],
      grantKeywords: ["trample"],
      text: "Attacking creatures you control get +1/+0 and have trample.",
    },
  ],
  faces: ["Breakneck Rider", "Neck Breaker"],
  transform: true,
});
