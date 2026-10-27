import { defineCard } from "../define.js";

// EDHREC rank 8479.
//
// Rulings:
//   [2024-01-12] If a creature token is exiled by Voyager Staff's ability, it will cease to exist.
//     It won't return to the battlefield.

const TEXT =
  "{2}, Sacrifice this artifact: Exile target creature. Return the exiled card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Voyager Staff",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, sacrifice: "self" },
      targets: ["creature"],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
