import { defineCard } from "../define.js";

// EDHREC rank 9216.
export default defineCard({
  name: "Drider",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Spider"],
  power: 4,
  toughness: 3,
  keywords: ["reach"],
  text: "Reach\nWhenever this creature deals combat damage to a player, create a 2/1 black Spider creature token with reach and menace.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "2/1 Black Spider Token (Menace, Reach)", count: 1 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, create a 2/1 black Spider creature token with reach and menace.",
    },
  ],
});
