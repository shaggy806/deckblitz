import { defineCard } from "../define.js";

// The target land's controller picks one of the two outcomes as this resolves
// (Dwarven Driller's `choices` shape); "them" is `"that-player"`, the chooser.
export default defineCard({
  name: "Lava Blister",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy target nonbasic land unless its controller has Lava Blister deal 6 damage to them.",
  targets: [{ kind: "permanent", filter: { notSupertype: "basic", type: "land" } }],
  effect: {
    kind: "each-player-may",
    who: { controllerOfTarget: 0 },
    choices: [
      {
        text: "Have Lava Blister deal 6 damage to you.",
        effect: { kind: "damage", amount: 6, who: "that-player" },
      },
      { text: "Let Lava Blister destroy the land.", effect: { kind: "destroy", target: 0 } },
    ],
  },
});
