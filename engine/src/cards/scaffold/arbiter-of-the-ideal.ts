import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 13253.
//
// Rulings:
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won’t be able to attack that turn (unless they gain haste).
//   [2014-02-01] The permanent will be an enchantment as it enters the battlefield and will cause
//     constellation abilities of permanents you control to trigger.
//   [2014-02-01] Inspired abilities don’t trigger when the creature enters the battlefield.
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.
//   [2014-02-01] If you choose to not put the card onto the battlefield, or if the card isn’t one
//     of the listed types, it will remain on top of your library. (Note that revealing the card is
//     not optional.)
//   [2014-02-01] The manifestation counter is a memory aid only. The permanent will continue to be
//     an enchantment in addition to its other types even if that counter is removed.
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.

export default defineCard({
  name: "Arbiter of the Ideal",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nInspired — Whenever this creature becomes untapped, reveal the top card of your library. If it's an artifact, creature, or land card, you may put it onto the battlefield with a manifestation counter on it. That permanent is an enchantment in addition to its other types.",
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, reveal the top card of your library. If it's an artifact, creature, or land card, you may put it onto the battlefield with a manifestation counter on it. That permanent is an enchantment in addition to its other types.
});
