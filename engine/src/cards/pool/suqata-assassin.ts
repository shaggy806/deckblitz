import { defineCard } from "../define.js";

export default defineCard({
  name: "Suq'Ata Assassin",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 1,
  toughness: 1,
  keywords: ["fear"],
  text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nWhenever this creature attacks and isn't blocked, defending player gets a poison counter. (A player with ten or more poison counters loses the game.)",
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "poison", amount: 1, who: "trigger-player" },
      resolve: null,
      text: "Whenever this creature attacks and isn't blocked, defending player gets a poison counter.",
    },
  ],
});
