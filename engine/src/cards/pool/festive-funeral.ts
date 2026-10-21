import { defineCard } from "../define.js";

// EDHREC rank 25939.
//
// Rulings:
//   [2019-10-04] Festive Funeral is still on the stack while you determine the value of X. It
//     doesn't contribute to the value of X.
//   [2019-10-04] The value of X is determined only as Festive Funeral begins to resolve.

const X = { product: [{ graveyardSize: "you" }, -1] } as const;

export default defineCard({
  name: "Festive Funeral",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn, where X is the number of cards in your graveyard.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
});
