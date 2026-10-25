import { defineCard } from "../define.js";

// EDHREC rank 18560.
//
// Rulings:
//   [2018-10-05] If you have no creature cards in your graveyard, the target creature gets -0/-0,
//     and it will still be exiled if it would die this turn.
//   [2018-10-05] Necrotic Wound's replacement effect will exile the target creature if it would
//     die this turn for any reason, not just immediately after Necrotic Wound resolves.
//   [2018-10-05] The value of X is determined only as the undergrowth ability resolves.
//   [2018-10-05] Because tokens aren't cards, they never count for undergrowth abilities.

const MINUS_X = { product: [{ countInGraveyard: { type: "creature", ownedBy: "you" } }, -1] } as const;

export default defineCard({
  name: "Necrotic Wound",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Undergrowth — Target creature gets -X/-X until end of turn, where X is the number of creature cards in your graveyard. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: MINUS_X, toughness: MINUS_X, duration: "end-of-turn" },
      { kind: "exile-if-dies-this-turn", target: 0 },
    ],
  },
});
