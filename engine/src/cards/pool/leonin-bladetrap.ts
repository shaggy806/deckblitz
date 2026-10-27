import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 28720.

const TEXT = "{2}, Sacrifice this artifact: It deals 2 damage to each attacking creature without flying.";

export default defineCard({
  name: "Leonin Bladetrap",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  keywords: ["flash"],
  text: `Flash (You may cast this spell any time you could cast an instant.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "damage-all",
        filter: { type: "creature", attacking: true, notKeyword: "flying" },
        amount: 2,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
