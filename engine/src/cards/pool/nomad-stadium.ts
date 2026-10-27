import { defineCard } from "../define.js";

const MANA_TEXT = "{T}: Add {W}. This land deals 1 damage to you.";
const LIFE_TEXT =
  "Threshold — {W}, {T}, Sacrifice this land: You gain 4 life. Activate only if there are seven or more cards in your graveyard.";

export default defineCard({
  name: "Nomad Stadium",
  colors: [],
  types: ["land"],
  text: `${MANA_TEXT}\n${LIFE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "W", amount: 1, painToController: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{W}", tap: true, sacrifice: "self" },
      condition: { kind: "threshold" },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: LIFE_TEXT,
    },
  ],
});
