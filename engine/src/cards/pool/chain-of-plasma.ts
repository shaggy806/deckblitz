import { defineCard } from "../define.js";

// EDHREC rank 20418. Chain of Vapor's shape: "that player or that
// permanent's controller" is the targeted player, or whoever controlled the
// targeted permanent as it last existed (rule 608.2h). Only a player with a
// card in hand is offered the discard; the copy is theirs to make, aim and
// control, so its own chain may go on.

const TEXT =
  "Chain of Plasma deals 3 damage to any target. Then that player or that permanent's controller may discard a card. If the player does, they may copy this spell and may choose a new target for that copy.";

export default defineCard({
  name: "Chain of Plasma",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ discard: 1, text: "Discard a card" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
          prompt: "Copy Chain of Plasma? (You may choose a new target for the copy.)",
          effect: { kind: "copy-spell", target: "source", newTargets: true },
        },
      },
    ],
  },
});
