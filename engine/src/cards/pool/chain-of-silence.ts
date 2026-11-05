import { defineCard } from "../define.js";

// EDHREC rank 29277. Chain of Vapor's chain: the copy is the player's to make,
// aim and control, so its own "that creature's controller" may carry it on.

export default defineCard({
  name: "Chain of Silence",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all damage target creature would deal this turn. That creature's controller may sacrifice a land of their choice. If the player does, they may copy this spell and may choose a new target for that copy.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", by: { target: 0 } },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ sacrifice: { type: "land" }, text: "Sacrifice a land" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
          prompt: "Copy Chain of Silence? (You may choose a new target for the copy.)",
          effect: { kind: "copy-spell", target: "source", newTargets: true },
        },
      },
    ],
  },
});
