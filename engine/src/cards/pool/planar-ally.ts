import { defineCard } from "../define.js";

export default defineCard({
  name: "Planar Ally",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever this creature attacks, venture into the dungeon.",
    },
  ],
});
