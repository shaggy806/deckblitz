import { defineCard } from "../define.js";

// Torment. EDHREC rank 29241. Dwarven Driller's punisher: the targeted player
// chooses (`each-player-may` of `controllerOfTarget`, a player target being
// its own controller) between the damage from Skullscorch and the random
// discard.

export default defineCard({
  name: "Skullscorch",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Target player discards two cards at random unless that player has Skullscorch deal 4 damage to them.",
  targets: ["player"],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    choices: [
      {
        text: "Discard two cards at random.",
        effect: { kind: "discard", target: "that-player", amount: 2, random: true },
      },
      {
        text: "Have Skullscorch deal 4 damage to you.",
        effect: { kind: "damage", amount: 4, who: "that-player" },
      },
    ],
  },
});
