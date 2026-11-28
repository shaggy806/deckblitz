import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 26359.
//
// Rulings:
//   If the revealed card is a creature card, Shapeshifter's Marrow becomes a copy of that card
//     permanently. It's no longer an enchantment.
//   If the revealed card isn't a creature card, it stays on top of that player's library.
//     Shapeshifter's Marrow remains an enchantment.
//
// The upkeep player reveals their top card; a creature card goes to their
// graveyard (no choice: `min: 1`), and `then` sees it there as slot 0, so the
// enchantment copies the card's printed values (`ofCard`, rule 707.2) for as
// long as it stays this object (rule 611.2a). A copy has only what it copies,
// so this ability is gone with the rest of its text.

const TEXT =
  "At the beginning of each opponent's upkeep, that player reveals the top card of their library. If it's a creature card, the player puts the card into their graveyard and this enchantment becomes a copy of that card. (If it does, it loses this ability.)";

export default defineCard({
  name: "Shapeshifter's Marrow",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "opponent" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        player: "active-player",
        zone: "library",
        count: 1,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "creature" },
        destination: "graveyard",
        leftover: "stay",
        then: { kind: "become-copy", target: "source", of: 0, ofCard: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
