import { defineCard } from "../define.js";

// Rulings:
//   You choose the value of X, the targets, and how damage will be divided as you cast Nahiri's
//     Sacrifice.
//   If some of the targets become illegal, the original division of damage still applies, but
//     the damage that would have been dealt to illegal targets isn't dealt at all.
//   You can't choose more than X targets, and each chosen target must receive at least 1 damage.
//
// X is announced as it's cast though the mana cost has none (rule 601.2b): the spell is offered
// once per mana value an artifact or creature you could sacrifice has, each offer naming only
// the permanents with that mana value (`additionalCostSacrifices` at X). The damage is Hail of
// Arrows' "X damage divided among any number of targets", at most X of them.
export default defineCard({
  name: "Nahiri's Sacrifice",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, sacrifice an artifact or creature with mana value X.\nNahiri's Sacrifice deals X damage divided as you choose among any number of target creatures.",
  additionalCost: {
    sacrifice: { typesAnyOf: ["artifact", "creature"], controlledBy: "you", manaValue: { op: "eq", n: "x" } },
  },
  targets: [{ kind: "any-number", of: { kind: "permanent", filter: { type: "creature" } }, max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: { kind: "damage-divided", from: 0 },
});
