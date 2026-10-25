import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 19055.
//
// Rulings:
//   [2014-02-01] Inspired abilities trigger no matter how the creature becomes untapped: by the
//     turn-based action at the beginning of the untap step or by a spell or ability.
//   [2014-02-01] If the inspired ability includes an optional cost, you decide whether to pay that
//     cost as the ability resolves. You can do this even if the creature leaves the battlefield in
//     response to the ability.
//   [2014-02-01] Inspired abilities don’t trigger when the creature enters the battlefield.
//   [2014-02-01] A creature taps when its regeneration shield is used, not when the shield is
//     created. Notably, you won’t be able to use Servant of Tymaret’s last ability to tap it so
//     that its inspired ability will trigger unless Servant of Tymaret would be destroyed.
//   [2014-02-01] If an inspired ability triggers during your untap step, the ability will be put
//     on the stack at the beginning of your upkeep. If the ability creates one or more token
//     creatures, those creatures won’t be able to attack that turn (unless they gain haste).

export default defineCard({
  name: "Servant of Tymaret",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 3,
  text: "Inspired — Whenever this creature becomes untapped, each opponent loses 1 life. You gain life equal to the life lost this way.\n{2}{B}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
  // TODO(scaffold): Inspired — Whenever this creature becomes untapped, each opponent loses 1 life. You gain life equal to the life lost this way.
});
