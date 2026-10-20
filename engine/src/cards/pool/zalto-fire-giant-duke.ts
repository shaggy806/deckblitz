import { defineCard } from "../define.js";

export default defineCard({
  name: "Zalto, Fire Giant Duke",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Barbarian"],
  power: 7,
  toughness: 3,
  keywords: ["trample"],
  text: "Trample\nWhenever Zalto is dealt damage, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever Zalto is dealt damage, venture into the dungeon.",
    },
  ],
});
