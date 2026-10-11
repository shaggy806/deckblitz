import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 20316.

const MANA_TEXT = "{T}: Add one mana of any color.";
const LOOT_TEXT = "{2}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Murmuring Volume",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Book"],
  text: `${MANA_TEXT}\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
