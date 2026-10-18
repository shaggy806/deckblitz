import { defineCard } from "../define.js";

// EDHREC rank 11124.
//
// The reduction is Depower's `targetCostReduction`: it changes only the total
// cost paid, never the mana value (3) — the ruling.

export default defineCard({
  name: "Ephara's Dispersal",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "This spell costs {2} less to cast if it targets an attacking creature.\nReturn target creature to its owner's hand. Surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  targets: ["creature"],
  targetCostReduction: { filter: { type: "creature", attacking: true }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "surveil", amount: 2 },
    ],
  },
});
