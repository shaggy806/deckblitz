import { defineCard } from "../define.js";

// The target creature's controller picks one of the two outcomes as this resolves
// (Dwarven Scorcher's `choices` shape); "them" is `"that-player"`, the chooser.
export default defineCard({
  name: "Blazing Salvo",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Blazing Salvo deals 3 damage to target creature unless that creature's controller has Blazing Salvo deal 5 damage to them.",
  targets: ["creature"],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    choices: [
      {
        text: "Have Blazing Salvo deal 5 damage to you.",
        effect: { kind: "damage", amount: 5, who: "that-player" },
      },
      { text: "Let Blazing Salvo deal 3 damage to the creature.", effect: { kind: "damage", amount: 3, target: 0 } },
    ],
  },
});
