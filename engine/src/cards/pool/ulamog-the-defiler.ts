import { defineCard } from "../define.js";
import { annihilator, ward } from "../helpers.js";

// Modern Horizons 3 (MH3). EDHREC rank 1566.
//
// Rulings:
//   The cast trigger resolves before Ulamog does, and still resolves if Ulamog
//     is countered in response.
//   Entering directly from exile, it sees itself among the cards in exile.
//   The annihilator reads its +1/+1 counters as that trigger resolves.
const CAST = "When you cast this spell, target opponent exiles the top half of their library, rounded up.";
const COUNTERS = "Ulamog enters with a number of +1/+1 counters on it equal to the greatest mana value among cards in exile.";
const ANNIHILATOR = "Ulamog has annihilator X, where X is the number of +1/+1 counters on it.";
const WARD = ward({ sacrifice: { filter: {}, count: 2, text: "Sacrifice two permanents" } });

export default defineCard({
  name: "Ulamog, the Defiler",
  manaCost: "{10}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 7,
  toughness: 7,
  text: `${CAST}\n${WARD.text}\n${COUNTERS}\n${ANNIHILATOR}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { aggregate: "max", of: "mana-value", filter: {}, in: "exile" } },
      },
      text: COUNTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: ["opponent"],
      effect: { kind: "exile-from-library", whose: 0, amount: { half: { librarySize: "each" }, round: "up" } },
      resolve: null,
      text: CAST,
    },
    WARD,
    annihilator({ countersOn: "source", counter: "+1/+1" }, ANNIHILATOR),
  ],
});
