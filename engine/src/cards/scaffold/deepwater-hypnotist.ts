import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 27175.
//
// Rulings:
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won’t be able to attack that turn (unless they gain haste).
//   [2014-02-01] Inspired abilities don’t trigger when the creature enters the battlefield.
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.

export default defineCard({
  name: "Deepwater Hypnotist",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Inspired — Whenever this creature becomes untapped, target creature an opponent controls gets -3/-0 until end of turn.",
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, target creature an opponent controls gets -3/-0 until end of turn.
});
