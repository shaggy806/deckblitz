import { defineCard } from "../define.js";

// Exodus (EXO). EDHREC rank 22998.

const TEXT = "{1}, {T}, Discard a card: Regenerate target creature.";

export default defineCard({
  name: "Medicine Bag",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
