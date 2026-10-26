import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 24051.
//
// One life gain of X for each of {G} and {W} spent on the whole cost, read as
// the spell resolves — a single gain of X + X when both were (the rulings: a
// "whenever you gain life" trigger fires once). A copy had no mana spent.

export default defineCard({
  name: "Dawnglow Infusion",
  manaCost: "{X}{G/W}",
  colors: ["W", "G"],
  types: ["sorcery"],
  text: "You gain X life if {G} was spent to cast this spell and X life if {W} was spent to cast this spell. (Do both if {G}{W} was spent.)",
  effect: {
    kind: "gain-life",
    amount: {
      sum: [
        { ifCondition: { kind: "source", filter: { manaSpentOfColors: { G: 1 } } }, then: "x", else: 0 },
        { ifCondition: { kind: "source", filter: { manaSpentOfColors: { W: 1 } } }, then: "x", else: 0 },
      ],
    },
  },
});
