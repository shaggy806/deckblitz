import { defineCard } from "../define.js";

// EDHREC rank 30196. "Two lands and this artifact": an `each` of three parts — two
// lands and the source (`isSource: true`) — every one a different
// permanent, sacrificed together as the cost is paid.

const TEXT = "{T}, Sacrifice two lands and this artifact: Destroy target attacking creature.";

export default defineCard({
  name: "Sandstone Deadfall",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { each: [{ type: "land" }, { type: "land" }, { isSource: true }] } },
      targets: [{ kind: "permanent", filter: { attacking: true, type: "creature" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
