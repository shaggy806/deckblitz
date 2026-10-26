import { defineCard } from "../define.js";

const TEXT = "{1}, {T}, Exile this artifact: Target player shuffles their graveyard into their library.";

export default defineCard({
  name: "Thran Foundry",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true, exileSelf: true },
      targets: ["player"],
      effect: { kind: "shuffle-graveyard-into-library", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
