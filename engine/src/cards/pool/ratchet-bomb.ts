import { defineCard } from "../define.js";

const CHARGE_TEXT = "{T}: Put a charge counter on this artifact.";
const BOMB_TEXT =
  "{T}, Sacrifice this artifact: Destroy each nonland permanent with mana value equal to the number of charge counters on this artifact.";

// The count is the artifact's as it was sacrificed (last-known information,
// rule 608.2h); a token that isn't a copy has mana value 0 (the rulings).
export default defineCard({
  name: "Ratchet Bomb",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${CHARGE_TEXT}\n${BOMB_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: 1 },
      resolve: null,
      text: CHARGE_TEXT,
    },
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "destroy-all",
        filter: {
          notTypes: ["land"],
          manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "charge" } } },
        },
      },
      resolve: null,
      text: BOMB_TEXT,
    },
  ],
});
