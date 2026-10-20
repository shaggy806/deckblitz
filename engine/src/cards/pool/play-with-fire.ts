import { defineCard } from "../define.js";

export default defineCard({
  name: "Play with Fire",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Play with Fire deals 2 damage to any target. If a player is dealt damage this way, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      {
        // A player was the target and the damage wasn't prevented.
        kind: "conditional",
        condition: { kind: "damage-dealt-this-way", to: 0, player: true },
        then: { kind: "scry", amount: 1 },
      },
    ],
  },
});
