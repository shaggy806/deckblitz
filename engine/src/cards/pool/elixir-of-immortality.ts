import { defineCard } from "../define.js";

const ELIXIR_TEXT =
  "{2}, {T}: You gain 5 life. Shuffle this artifact and your graveyard into their owner's library.";

export default defineCard({
  name: "Elixir of Immortality",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: ELIXIR_TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      // The artifact goes into its owner's library only from the battlefield;
      // already in your graveyard, it goes with the rest (the rulings).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 5 },
          { kind: "shuffle-into-library", target: "source" },
          { kind: "shuffle-graveyard-into-library", target: "you" },
        ],
      },
      resolve: null,
      text: ELIXIR_TEXT,
    },
  ],
});
