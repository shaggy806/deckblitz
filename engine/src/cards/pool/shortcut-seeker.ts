import { defineCard } from "../define.js";

export default defineCard({
  name: "Shortcut Seeker",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 5,
  text: "Whenever this creature deals combat damage to a player, venture into the dungeon. (Enter the first room or advance to the next room.)",
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
