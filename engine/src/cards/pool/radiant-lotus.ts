import { defineCard } from "../define.js";

// EDHREC rank 5668.
//
// Not a mana ability: it targets (rule 605.5a), so it uses the stack. The
// colour is chosen as it resolves (608.2d), by its controller ("Choose a
// color"), and the target player adds three of it for each artifact
// sacrificed — the X the cost announced ("one or more": `minX` 1). Radiant
// Lotus itself may be one of them.

export default defineCard({
  name: "Radiant Lotus",
  manaCost: "{6}",
  colors: [],
  types: ["artifact"],
  text: "{T}, Sacrifice one or more artifacts: Choose a color. Target player adds three mana of the chosen color for each artifact sacrificed this way. (Activate only as an instant.)",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" }, count: "x" } },
      targets: ["player"],
      effect: { kind: "add-mana", mana: "any-color", amount: { product: [3, "x"] }, target: 0 },
      resolve: null,
      text: "{T}, Sacrifice one or more artifacts: Choose a color. Target player adds three mana of the chosen color for each artifact sacrificed this way. (Activate only as an instant.)",
      minX: 1,
    },
  ],
});
