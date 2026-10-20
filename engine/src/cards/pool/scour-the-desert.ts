import { defineCard } from "../define.js";

// EDHREC rank 22023. Modern Horizons 2.
//
// X is the card's toughness **in the graveyard**, not in exile (its ruling —
// a characteristic-defining toughness like Tarmogoyf's can differ once the
// card has left). So X is read before the card moves: the Birds are created
// from the toughness the card has there, then it's exiled, both in the one
// resolution — nothing can happen between the two, and the triggers either
// causes wait until the spell has finished resolving.
export default defineCard({
  name: "Scour the Desert",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature card from your graveyard. Create X 1/1 white Bird creature tokens with flying, where X is the exiled card's toughness.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Bird Token", count: { toughnessOf: 0 } },
      { kind: "exile", target: 0 },
    ],
  },
});
