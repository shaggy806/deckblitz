import { defineCard } from "../define.js";

// EDHREC rank 21642.

export default defineCard({
  name: "Intrepid Outlander",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Orc", "Ranger"],
  power: 2,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nPack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Pack tactics — Whenever this creature attacks, if you attacked with creatures with total power 6 or greater this combat, venture into the dungeon.",
      condition: { kind: "turn-stat", stat: "power-attacked-with-this-combat", who: "you", atLeast: 6 },
    },
  ],
});
