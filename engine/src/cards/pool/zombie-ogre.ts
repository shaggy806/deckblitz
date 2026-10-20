import { defineCard } from "../define.js";

export default defineCard({
  name: "Zombie Ogre",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Ogre"],
  power: 3,
  toughness: 5,
  text: "At the beginning of your end step, if a creature died this turn, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "At the beginning of your end step, if a creature died this turn, venture into the dungeon.",
      condition: { kind: "creature-died-this-turn" },
    },
  ],
});
