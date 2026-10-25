import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 8352.
//
// Rulings:
//   [2013-09-15] When you scry, you may put all the cards you look at back on top of your library,
//     you may put all of those cards on the bottom of your library, or you may put some of those
//     cards on top and the rest of them on the bottom.
//   [2013-09-15] Scry appears on some spells and abilities with one or more targets. If all of the
//     spell or ability’s targets are illegal when it tries to resolve, it won’t resolve and none
//     of its effects will happen. You won’t scry.
//   [2013-09-15] You choose how to order cards returned to your library after scrying no matter
//     where you put them.
//   [2013-09-15] You perform the actions stated on a card in sequence. For some spells and
//     abilities, that means you’ll scry last. For others, that means you’ll scry and then perform
//     other actions.
//   [2014-02-01] If the copied creature is a token, the token created by Fated Infatuation copies
//     the original characteristics of that token as stated by the effect that put the token onto
//     the battlefield.
//   [2014-02-01] Any enters-the-battlefield abilities of the copied creature will trigger when the
//     token enters the battlefield. Any “as [this permanent] enters the battlefield” or “[this
//     permanent] enters the battlefield with” abilities of the copied creature will also work.
//   [2014-02-01] If the copied creature has {X} in its mana cost, X is considered to be zero.
//   [2014-02-01] The token copies exactly what was printed on the original creature and nothing
//     else (unless that permanent is copying something else or is a token; see below). It doesn’t
//     copy whether that creature is tapped or untapped, whether it has any counters on it or Auras
//     and Equipment attached to it, or any non-copy effects that have changed its power,
//     toughness, types, color, and so on.
//   [2014-02-01] If the copied creature is copying something else (for example, if the copied
//     creature is a Clone), then the token enters the battlefield as whatever that creature
//     copied.

export default defineCard({
  name: "Fated Infatuation",
  manaCost: "{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Create a token that's a copy of target creature you control. If it's your turn, scry 2.",
  // TODO(scaffold): Create a token that's a copy of target creature you control.
  // TODO(scaffold): If it's your turn, scry 2.
});
