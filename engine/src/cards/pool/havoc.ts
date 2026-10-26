import { defineCard } from "../define.js";

// Ruling [2004-10-04]: in multiplayer it affects every opponent.

export default defineCard({
  name: "Havoc",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Whenever an opponent casts a white spell, they lose 2 life.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { colors: ["W"] } },
      targets: [],
      effect: { kind: "lose-life", amount: 2, who: "trigger-controller" },
      resolve: null,
      text: "Whenever an opponent casts a white spell, they lose 2 life.",
    },
  ],
});
