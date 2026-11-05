import { defineCard } from "../define.js";
import type { EnterTypes } from "../../effects.js";

// EDHREC rank 11107.
//
// Rulings:
//   [2016-04-08] If a targeted creature card is normally colorless, it will simply become black.
//     It won't be both black and colorless.
//
// The two return together, each a black Zombie in addition to its other
// colours and types as it enters (`enterAs`, rule 614.12); then the spell
// goes to the bottom of its owner's library (Sanguine Sacrament).
const ZOMBIE: EnterTypes = { addColors: ["B"], addSubtypes: ["Zombie"] };

export default defineCard({
  name: "Ever After",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return up to two target creature cards from your graveyard to the battlefield. Each of those creatures is a black Zombie in addition to its other colors and types. Put Ever After on the bottom of its owner's library.",
  targets: [
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
    {
      kind: "optional",
      of: {
        kind: "other",
        of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
        than: { slots: [0] },
      },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "put-onto-battlefield", target: 0, enterAs: ZOMBIE },
          { kind: "put-onto-battlefield", target: 1, enterAs: ZOMBIE },
        ],
      },
      { kind: "put-on-library", target: "source", position: "bottom" },
    ],
  },
});
