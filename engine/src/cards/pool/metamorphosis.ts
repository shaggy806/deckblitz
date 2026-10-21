import { defineCard } from "../define.js";

// EDHREC rank 8614.
//
// Burnt Offering's shape: the sacrificed creature's mana value read off the
// additional cost, plus one, as one colour of the caster's choice
// (Somberwald Sage's "any one color"), spendable only on creature spells.

export default defineCard({
  name: "Metamorphosis",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  additionalCost: { sacrifice: { type: "creature", controlledBy: "you" } },
  text: "As an additional cost to cast this spell, sacrifice a creature.\nAdd X mana of any one color, where X is 1 plus the sacrificed creature's mana value. Spend this mana only to cast creature spells.",
  targets: [],
  effect: {
    kind: "add-mana",
    mana: "any-color",
    amount: { sum: [1, { manaValueOf: "sacrificed" }] },
    spendOnly: { spell: { type: "creature" }, text: "Spend this mana only to cast creature spells." },
  },
});
