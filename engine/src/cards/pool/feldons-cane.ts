import { defineCard } from "../define.js";

// EDHREC rank 7496. Antiquities. The Cane is exiled as a cost, so it isn't in
// the graveyard it shuffles.

const TEXT = "{T}, Exile this artifact: Shuffle your graveyard into your library.";

export default defineCard({
  name: "Feldon's Cane",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, exileSelf: true },
      targets: [],
      effect: { kind: "shuffle-graveyard-into-library", target: "you" },
      resolve: null,
      text: TEXT,
    },
  ],
});
