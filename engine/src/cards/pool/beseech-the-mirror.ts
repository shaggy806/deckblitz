import { defineCard } from "../define.js";

// Bargain (rule 702.166) is an optional additional cost: a kicker with no
// mana (Agatha's Champion). The found card is exiled face down; bargained,
// it may be cast free if its mana value is 4 or less, and goes to hand if not
// cast (Discover the Impossible's shape).
export default defineCard({
  name: "Beseech the Mirror",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  kicker: { cost: "", keyword: "bargain" },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nSearch your library for a card, exile it face down, then shuffle. If this spell was bargained, you may cast the exiled card without paying its mana cost if that spell's mana value is 4 or less. Put the exiled card into your hand if it wasn't cast this way.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: {},
    destination: "exile-face-down",
    min: 1,
    max: 1,
    then: {
      kind: "conditional",
      condition: { kind: "self-kicked" },
      then: {
        kind: "cast-now",
        target: 0,
        free: true,
        spell: { manaValue: { op: "lte", n: 4 } },
        else: { kind: "return-to-hand", target: 0, from: "exile" },
      },
      else: { kind: "return-to-hand", target: 0, from: "exile" },
    },
  },
});
