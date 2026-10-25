import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 14142.
//
// Rulings:
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.
//   [2014-02-01] If another creature becomes or enters the battlefield as a copy of the token,
//     that creature won’t have haste and you won’t exile it. However, if Felhide Spiritbinder
//     creates multiple tokens due to a replacement effect (like the one Doubling Season creates),
//     each of those tokens will have haste and you’ll exile each of them.
//   [2014-02-01] If the copied creature has {X} in its mana cost, X is considered to be zero.
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.
//   [2014-02-01] Inspired abilities don’t trigger when the creature enters the battlefield.
//   [2014-02-01] If the copied creature is copying something else (for example, if the copied
//     creature is a Clone), then the token enters the battlefield as whatever that creature
//     copied.
//   [2014-02-01] The token copies exactly what was printed on the original creature (except that
//     the copy is also an enchantment) and nothing else (unless that permanent is copying
//     something else or is a token; see below). It doesn’t copy whether that creature is tapped or
//     untapped, whether it has any counters on it or Auras and Equipment attached to it, or any
//     non-copy effects that have changed its power, toughness, types, color, and so on.
//   [2014-02-01] Any enters-the-battlefield abilities of the copied creature will trigger when the
//     token enters the battlefield. Any “as [this permanent] enters the battlefield” or “[this
//     permanent] enters the battlefield with” abilities of the copied creature will also work.
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won’t be able to attack that turn (unless they gain haste).
//   [2014-02-01] If the copied creature is a token, the token created by Felhide Spiritbinder
//     copies the original characteristics of that token as stated by the effect that put the token
//     onto the battlefield.

export default defineCard({
  name: "Felhide Spiritbinder",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 3,
  toughness: 4,
  text: "Inspired — Whenever this creature becomes untapped, you may pay {1}{R}. If you do, create a token that's a copy of another target creature, except it's an enchantment in addition to its other types. It gains haste. Exile it at the beginning of the next end step.",
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, you may pay {1}{R}. If you do, create a token that's a copy of another target creature, except it's an enchantment in addition to its other types. It gains haste. Exile it at the beginning of the next end step.
});
