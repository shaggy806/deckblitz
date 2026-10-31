import { defineCard } from "../define.js";

// "If you have no land cards in hand, you may reveal your hand rather than
// pay this spell's mana cost": an alternative cost (rule 118.9) with
// `revealHand` (701.20a) under a `hand-size` condition counting land cards.

export default defineCard({
  name: "Land Grant",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "If you have no land cards in hand, you may reveal your hand rather than pay this spell's mana cost.\nSearch your library for a Forest card, reveal that card, put it into your hand, then shuffle.",
  alternativeCost: {
    mana: "{0}",
    revealHand: true,
    condition: { kind: "hand-size", atMost: 0, filter: { type: "land" } },
  },
  effect: { kind: "search-library", filter: { subtype: "Forest" }, destination: "hand", min: 0, max: 1, reveal: true },
});
