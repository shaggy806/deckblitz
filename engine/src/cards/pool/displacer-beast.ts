import { defineCard } from "../define.js";

export default defineCard({
  name: "Displacer Beast",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Cat", "Beast"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, venture into the dungeon. (Enter the first room or advance to the next room.)\nDisplacement — {3}{U}: Return this creature to its owner's hand.",
  activated: [
    {
      cost: { mana: "{3}{U}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: "Displacement — {3}{U}: Return this creature to its owner's hand.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this creature enters, venture into the dungeon.",
    },
  ],
});
