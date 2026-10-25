import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 18905.
//
// Rulings:
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.
//   [2014-02-01] Inspired abilities don’t trigger when the creature enters the battlefield.
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won’t be able to attack that turn (unless they gain haste).
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.

export default defineCard({
  name: "Oreskos Sun Guide",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Monk"],
  power: 2,
  toughness: 2,
  text: "Inspired — Whenever this creature becomes untapped, you gain 2 life.",
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, you gain 2 life.
});
