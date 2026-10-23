import { defineCard } from "../define.js";

// Rulings:
//   [2023-09-01] Some instant and sorcery spells require additional targets if they're bargained.
//     You ignore those targeting requirements if those spells aren't bargained, and you can't
//     bargain those spells unless you can choose the appropriate targets. On the other hand, you
//     can bargain a permanent spell even if you won't be able to choose targets for an
//     enters-the-battlefield ability of that permanent once the spell resolves.
//   [2023-09-01] Bargain represents an optional additional cost. A spell cast with that additional
//     cost paid is "bargained."
//   [2023-09-01] Bargain means "As an additional cost to cast this spell, you may sacrifice an
//     artifact, enchantment, or token."
//   [2023-09-01] Torch the Tower's last replacement effect will exile the target permanent if it
//     would die this turn for any reason, not just due to lethal damage or having 0 loyalty.
//   [2023-09-01] You may sacrifice only one artifact, enchantment, or token to pay a spell's
//     bargain cost.
//   [2023-09-01] If you copy a bargained spell, the copy is also bargained. If a card or token
//     enters the battlefield as a copy of a permanent that's already on the battlefield, the new
//     permanent isn't bargained, even if the original was.

export default defineCard({
  name: "Torch the Tower",
  manaCost: "{R}",
  colors: ["R"],
  types: ["instant"],
  kicker: {
    cost: "",
    keyword: "bargain",
    effect: {
      kind: "sequence",
      effects: [
        { kind: "damage", amount: 3, target: 0 },
        { kind: "scry", amount: 1 },
        { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "permanent" },
      ],
    },
  },
  text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nTorch the Tower deals 2 damage to target creature or planeswalker. If this spell was bargained, instead it deals 3 damage to that permanent and you scry 1.\nIf a permanent dealt damage by Torch the Tower would die this turn, exile it instead.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 2, target: 0 },
      { kind: "exile-if-dies-this-turn", dealtDamageThisWay: "permanent" },
    ],
  },
});
