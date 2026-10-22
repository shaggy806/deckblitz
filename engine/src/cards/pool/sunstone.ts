import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 15366.

const TEXT = "{2}, Sacrifice a snow land: Prevent all combat damage that would be dealt this turn.";

export default defineCard({
  name: "Sunstone",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: {
        mana: "{2}",
        tap: false,
        sacrifice: { filter: { type: "land", supertype: "snow", controlledBy: "you" } },
      },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: TEXT,
    },
  ],
});
