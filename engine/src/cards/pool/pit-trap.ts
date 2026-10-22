import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 25456.

const TEXT = "{2}, {T}, Sacrifice this artifact: Destroy target attacking creature without flying. It can't be regenerated.";

export default defineCard({
  name: "Pit Trap",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, notKeyword: "flying" } }],
      effect: { kind: "destroy", target: 0, cantBeRegenerated: true },
      resolve: null,
      text: TEXT,
    },
  ],
});
