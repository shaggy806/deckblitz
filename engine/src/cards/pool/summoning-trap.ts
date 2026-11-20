import { defineCard } from "../define.js";

// EDHREC rank 18160.
//
// The journal's `countered` entries (rule 701.6a): a creature spell you cast
// this turn, read as it was cast, countered by a spell or ability an
// opponent controlled — never one countered on resolution for want of legal
// targets (608.2b), nor a copy, which wasn't cast (707.10). The {0} is an
// alternative cost (rule 118.9); the trap may still be cast for its mana cost.
// With seven or fewer cards in your library you look at them all (its ruling).
const ALT_TEXT =
  "If a creature spell you cast this turn was countered by a spell or ability an opponent controlled, you may pay {0} rather than pay this spell's mana cost.";
const LOOK_TEXT =
  "Look at the top seven cards of your library. You may put a creature card from among them onto the battlefield. Put the rest on the bottom of your library in any order.";

export default defineCard({
  name: "Summoning Trap",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  subtypes: ["Trap"],
  text: `${ALT_TEXT}\n${LOOK_TEXT}`,
  alternativeCost: {
    mana: "{0}",
    condition: { kind: "turn-history", what: "countered", who: "you", filter: { type: "creature" }, by: "opponent" },
  },
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 7,
    min: 0,
    max: 1,
    filter: { type: "creature" },
    destination: "battlefield",
    leftover: "bottom-any-order",
  },
});
