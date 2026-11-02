import { defineCard } from "../define.js";

const EXILE_TEXT = "{T}, Exile a creature you control: Put a storage counter on this land.";
const MANA_TEXT = "{T}: Add {C} for each storage counter on this land.";

export default defineCard({
  name: "City of Shadows",
  types: ["land"],
  text: `${EXILE_TEXT}\n${MANA_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "creature", controlledBy: "you" } }, exilesSacrifice: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "storage", amount: 1 },
      resolve: null,
      text: EXILE_TEXT,
    },
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: { countersOn: "source", counter: "storage" } },
      resolve: null,
      text: MANA_TEXT,
    },
  ],
});
