import { defineCard } from "../define.js";

// EDHREC rank 10503.
//
// Rulings:
//   [2024-07-26] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2024-07-26] Once the exiled permanent returns, it's considered a new object with no relation
//     to the object that it was. Auras attached to the exiled permanent will be put into their
//     owners' graveyards. Equipment attached to the exiled permanent will become unattached and
//     remain on the battlefield. Any counters on the exiled permanent will cease to exist.
//
// "Up to one other target creature you control" is an optional slot that
// can't name the Duo itself; the return at the next end step is the
// delayed half of a `flicker` (Kykar, Zephyr Awakener's shape).

const TEXT =
  "When this creature enters, exile up to one other target creature you control. Return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Skyskipper Duo",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Bird", "Frog"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
