import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add one mana of any color.";
const DRAW_TEXT =
  "{7}, {T}, Sacrifice this artifact: Draw X cards, where X is the number of differently named lands you control.";

export default defineCard({
  name: "All-Fates Scroll",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${DRAW_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{7}", tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "draw",
        amount: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
