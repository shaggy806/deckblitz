import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 17642.
//
// Rulings:
//   [2014-02-01] If the mana cost of the revealed card includes {X}, X is considered to be 0.
//   [2014-02-01] Inspired abilities don't trigger when the creature enters the battlefield.
//   [2014-02-01] If the revealed card doesn't have a mana cost (because it's a land card, for
//     example), its mana value is 0.
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won't be able to attack that turn (unless they gain haste).
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.

export default defineCard({
  name: "Pain Seer",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Inspired — Whenever this creature becomes untapped, reveal the top card of your library and put that card into your hand. You lose life equal to that card's mana value.",
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, reveal the top card of your library and put that card into your hand. You lose life equal to that card's mana value.
});
