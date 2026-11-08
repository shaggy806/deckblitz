import { defineCard } from "../define.js";

// EDHREC rank 27014.

const TEXT =
  "{T}, Sacrifice this artifact: Return all Auras attached to target permanent you own to their owners' hands. Draw a card at the beginning of the next turn's upkeep.";

export default defineCard({
  name: "Scarab of the Unseen",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [{ kind: "permanent", filter: { ownedBy: "you" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "return-to-hand-all", filter: { subtype: "Aura", attachedToObject: 0 } },
          {
            kind: "delayed-trigger",
            at: "next-upkeep",
            text: "Draw a card at the beginning of the next turn's upkeep.",
            effect: { kind: "draw", amount: 1 },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
