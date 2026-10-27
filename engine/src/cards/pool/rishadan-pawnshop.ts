import { defineCard } from "../define.js";

const TEXT = "{2}, {T}: Shuffle target nontoken permanent you control into its owner's library.";

export default defineCard({
  name: "Rishadan Pawnshop",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "permanent", filter: { token: false, controlledBy: "you" } }],
      effect: { kind: "shuffle-into-library", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
