import { defineCard } from "../define.js";

// EDHREC rank 18611.
//
// Rulings:
//   [2022-02-18] You may cast the card you exile with Discover the Impossible as long as the
//     resulting spell is an instant spell with mana value 2 or less, even if the card you exiled
//     doesn't match that criteria. This may happen if you exile a split card, a modal
//     double-faced card, an adventurer card, or similar.
//
// Hideaway's "exile one of them face down" (one of the five must be exiled),
// then Breaching Dragonstorm's free cast with its "if you don't, put that card
// into your hand". `cast-now`'s `spell` filter is matched against the spell
// the card would be (rule 601.3e), which is the ruling's reading.

export default defineCard({
  name: "Discover the Impossible",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Look at the top five cards of your library. Exile one of them face down and put the rest on the bottom of your library in a random order. You may cast the exiled card without paying its mana cost if it's an instant spell with mana value 2 or less. If you don't, put that card into your hand.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 5,
    min: 1,
    max: 1,
    destination: "exile-face-down",
    leftover: "bottom-random",
    then: {
      kind: "cast-now",
      target: 0,
      free: true,
      spell: { type: "instant", manaValue: { op: "lte", n: 2 } },
      else: { kind: "return-to-hand", target: 0, from: "exile" },
    },
  },
});
