import { defineCard } from "../define.js";

// EDHREC rank 1503.
//
// Rulings:
//   [2004-10-04] If there is no other legal target for the spell, this does not change the target.
//   [2004-10-04] This only targets the spell being changed, not the original or new target of the
//     spell it is affecting.
//   [2004-10-04] The target of a spell that targets another spell on the stack can be changed to
//     any other spell on the stack, even if the new target will resolve before the spell does.
//   [2004-10-04] This does not check if the current target is legal. It just checks if the spell
//     has a single target.
//   [2004-10-04] You can choose to make a spell on the stack target this spell (if such a target
//     choice would be legal had the spell been cast while this spell was on the stack). The new
//     target for the deflected spell is not chosen until this spell resolves. This spell is still
//     on the stack when new targets are selected for the spell.
//   [2004-10-04] You choose the spell to target on announcement, but you pick the new target for
//     that spell on resolution.
//   [2004-10-04] Once the spell resolves, the new target is considered to be targeted by the
//     deflected spell. This will trigger any effects which trigger on being targeted.
//   [2004-10-04] You can’t make a spell which is on the stack target itself.

export default defineCard({
  name: "Misdirection",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "You may exile a blue card from your hand rather than pay this spell's mana cost.\nChange the target of target spell with a single target.",
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["U"] }, text: "a blue card" } },
  targets: [{ kind: "stack", spells: "any", abilities: false, singleTarget: true }],
  effect: { kind: "change-targets", target: 0, how: "change" },
});
