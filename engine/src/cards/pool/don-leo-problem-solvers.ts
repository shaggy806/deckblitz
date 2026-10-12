import { defineCard } from "../define.js";

// EDHREC rank 14073.
//
// Rulings:
//   [2026-01-27] If a token is exiled this way, it will cease to exist and won't return to the
//     battlefield.
//   [2026-01-27] Once a permanent exiled this way returns, it's considered a new object with no
//     relation to the object that it was. Auras attached to the exiled permanent will be put into
//     their owners' graveyards. Equipment attached to the exiled permanent will become unattached
//     and remain on the battlefield. Any counters on the exiled permanent will cease to exist.
//
// Two "target" words, two optional slots — an artifact creature may be chosen
// for both (rule 115.3), and is exiled once. Both are exiled together and
// return together (`flicker` over several slots, Ghostly Flicker's shape), so
// each sees the other enter; a token stays gone (the ruling).

export default defineCard({
  name: "Don & Leo, Problem Solvers",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 4,
  toughness: 6,
  keywords: ["vigilance"],
  text: "Vigilance\nAt the beginning of your end step, exile up to one target artifact you control and up to one target creature you control. Then return them to the battlefield under their owners' control.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { type: "artifact" } } },
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { type: "creature" } } },
      ],
      effect: { kind: "flicker", target: [0, 1] },
      resolve: null,
      text: "At the beginning of your end step, exile up to one target artifact you control and up to one target creature you control. Then return them to the battlefield under their owners' control.",
    },
  ],
});
