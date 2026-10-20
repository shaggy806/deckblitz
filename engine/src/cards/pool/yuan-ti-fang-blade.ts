import { defineCard } from "../define.js";

export default defineCard({
  name: "Yuan-Ti Fang-Blade",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: "Deathtouch\nWhenever this creature deals combat damage to a player, venture into the dungeon. (Enter the first room or advance to the next room.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, venture into the dungeon.",
    },
  ],
});
