import { defineCard } from "../define.js";

// EDHREC rank 15982.
//
// Any tapping fires it — attacking, a cost, an opponent's tap effect (rule
// 701.26a; `becomes-tapped`). Wiccan's flicker with an optional target.

const TEXT =
  "Whenever this creature becomes tapped, exile up to one target nonland, nontoken permanent. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Mistmeadow Vanisher",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", filter: { notTypes: ["land"], token: false } } }],
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
