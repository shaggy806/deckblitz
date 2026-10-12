import { defineCard } from "../define.js";
import { distinctTargets } from "../helpers.js";

// EDHREC rank 12127.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
//
// "Up to two target creatures" is one instance of "target" over two slots
// (`distinctTargets`), airbended together (rule 603.10a).
const DRAW_TEXT = "Target player draws two cards, then discards a card.";
const AIRBEND_TEXT = "Airbend up to two target creatures.";

export default defineCard({
  name: "Whirlwind Technique",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  subtypes: ["Lesson"],
  text:
    `${DRAW_TEXT}\n${AIRBEND_TEXT} ` +
    "(To airbend a creature, exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)",
  targets: ["player", ...distinctTargets(2, "creature", { optional: true, from: 1 })],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 2, target: 0 },
      { kind: "discard", target: 0, amount: 1 },
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "exile", target: 1, airbend: true },
          { kind: "exile", target: 2, airbend: true },
        ],
      },
    ],
  },
});
