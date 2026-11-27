import { defineCard } from "../define.js";

// An alternative cost exiling "the top three black cards of your graveyard"
// (rule 118.9, `alternativeCost.also`'s `fromTop`): which three is no choice
// — the first three black cards down from the top of the pile (rule 404.2).

export default defineCard({
  name: "Spinning Darkness",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "You may exile the top three black cards of your graveyard rather than pay this spell's mana cost.\nSpinning Darkness deals 3 damage to target nonblack creature. You gain 3 life.",
  alternativeCost: {
    mana: "{0}",
    also: {
      text: "exile the top three black cards of your graveyard",
      exileFromGraveyard: { count: 3, filter: { colors: ["B"] }, fromTop: true },
    },
  },
  targets: ["nonblack-creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 3 }],
  },
});
