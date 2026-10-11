import { defineCard } from "../define.js";

// EDHREC rank 16343.

const MANA_TEXT = "{T}: Add {R}. This land deals 1 damage to you.";
const LOOT_TEXT = "{2}{R}, {T}, Discard a card: Draw a card.";

export default defineCard({
  name: "Fogwell's Gym",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${LOOT_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1, painToController: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
  ],
});
