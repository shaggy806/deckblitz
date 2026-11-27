import { defineCard } from "../define.js";

// EDHREC rank 23085. Harm's Way's redirection shield over you and your
// creatures (`your-side-creatures`), its amount the spell's X — paid, or the
// exiled white card's mana value (`manaValueX`) — read as it resolves. Where
// the source's damage to several of them at once is more than X, you choose
// which is redirected (rule 615.7, the ruling); a target gone when the damage
// would be dealt redirects nothing.
//
// Rulings:
//   The redirection protects both you and your creatures from the source. If the source
//   would deal more than X damage to multiple objects, you decide which damage is
//   redirected until X is used up.
//   If the player or creature that was targeted is no longer playing or on the
//   battlefield when the damage would occur, the damage isn't redirected.

export default defineCard({
  name: "Shining Shoal",
  manaCost: "{X}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "You may exile a white card with mana value X from your hand rather than pay this spell's mana cost.\nThe next X damage that a source of your choice would deal to you and/or creatures you control this turn is dealt to any target instead.",
  targets: ["any-target"],
  alternativeCost: { mana: "{0}", exileFromHand: { filter: { colors: ["W"] }, text: "a white card", manaValueX: true } },
  effect: { kind: "prevent-damage-from-chosen-source", to: "your-side-creatures", amount: "x", redirectTo: 0 },
});
