import { defineCard } from "../define.js";

// Fifth Edition (5ED). Only the nonland cards go in, the library is shuffled
// either way, and the life is the cards that went in ("shuffled-into-library"
// this way).

const TEXT =
  "{5}, {T}, Exile this artifact: Shuffle all nonland cards from your graveyard into your library. You gain life equal to the number of cards shuffled into your library this way.";

export default defineCard({
  name: "Elixir",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `This artifact enters tapped.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This artifact enters tapped.",
    },
  ],
  activated: [
    {
      cost: { mana: "{5}", tap: true, exileSelf: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "shuffle-graveyard-into-library", target: "you", filter: { notTypes: ["land"] } },
          { kind: "gain-life", amount: { thisWay: "shuffled-into-library" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
