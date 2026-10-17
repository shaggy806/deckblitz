import { defineCard } from "../define.js";

export default defineCard({
  name: "Time Beetle",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Alien", "Insect"],
  power: 1,
  toughness: 1,
  keywords: ["skulk"],
  text: "Skulk (This creature can't be blocked by creatures with greater power.)\nParallel Universe — Whenever this creature deals combat damage to a player, time travel. (For each suspended card you own and each permanent you control with a time counter on it, you may add or remove a time counter.)",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "time-travel" },
      resolve: null,
      text: "Parallel Universe — Whenever this creature deals combat damage to a player, time travel.",
    },
  ],
});
