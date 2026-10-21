import { defineCard } from "../define.js";

// EDHREC rank 28003. "A permanent you both own and control" — both clauses
// on the target, so it always goes to your hand.

const TEXT = "{6}, {T}: Return target permanent you both own and control to your hand.";

export default defineCard({
  name: "Obelisk of Undoing",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{6}", tap: true },
      targets: [{ kind: "permanent", filter: { controlledBy: "you", ownedBy: "you" } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
