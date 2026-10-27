import { defineCard } from "../define.js";

// Rulings:
//   [2019-06-14] Wing Shards doesn't target the creature to be sacrificed. The target player
//     chooses the creature as it resolves.
//   [2019-06-14] The copies storm creates are created on the stack, so they're not cast.

export default defineCard({
  name: "Wing Shards",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target player sacrifices an attacking creature of their choice.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
  targets: ["player"],
  effect: { kind: "sacrifice", who: "target", filter: { type: "creature", attacking: true }, count: 1 },
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm",
    },
  ],
});
