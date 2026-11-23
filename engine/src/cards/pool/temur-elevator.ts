import { defineCard } from "../define.js";

// The life loss is part of the mana ability (the ruling: it doesn't use the
// stack), so it rides on the mana as `also`, read as the mana is made.

const MANA_TEXT = "{T}: Add {G}, {U}, or {R}. If you don't have the city's blessing, you lose 1 life.";

export default defineCard({
  name: "Temur Elevator",
  colors: [],
  types: ["land"],
  keywords: ["ascend"],
  text: `Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: { oneOf: ["G", "U", "R"] },
        amount: 1,
        also: {
          kind: "conditional",
          condition: { kind: "not", of: { kind: "citys-blessing" } },
          then: { kind: "lose-life", amount: 1 },
        },
      },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
