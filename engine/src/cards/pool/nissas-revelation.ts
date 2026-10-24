import { defineCard } from "../define.js";

// EDHREC rank 17970.
// The life is gained before the cards are drawn so the toughness is read
// while the revealed card is still on top of the library: the two are one
// instruction, with nothing able to happen between them.

export default defineCard({
  name: "Nissa's Revelation",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Scry 5, then reveal the top card of your library. If it's a creature card, you draw cards equal to its power and you gain life equal to its toughness.",
  targets: [],
  effect: {
    kind: "scry",
    amount: 5,
    then: {
      kind: "reveal-top",
      then: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { type: "creature" } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "gain-life", amount: { toughnessOf: 0 } },
            { kind: "draw", amount: { powerOf: 0 } },
          ],
        },
      },
    },
  },
});
