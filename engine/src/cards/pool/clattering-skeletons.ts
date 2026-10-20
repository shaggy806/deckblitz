import { defineCard } from "../define.js";

export default defineCard({
  name: "Clattering Skeletons",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 4,
  toughness: 3,
  text: "When this creature dies, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "When this creature dies, venture into the dungeon.",
    },
  ],
});
