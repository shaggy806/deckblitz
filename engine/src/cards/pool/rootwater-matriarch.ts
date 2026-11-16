import { defineCard } from "../define.js";

// EDHREC rank 24509.

const STEAL_TEXT = "{T}: Gain control of target creature for as long as that creature is enchanted.";

// An unenchanted creature can be targeted, but nothing changes hands (its
// ruling; rule 611.2b). The control lasts while any Aura is attached to it,
// whoever controls the Aura, and ends for good the moment none is — a new
// Aura doesn't bring it back. Whether this stays tapped has no bearing.
export default defineCard({
  name: "Rootwater Matriarch",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 2,
  toughness: 3,
  text: STEAL_TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileIt: { enchanted: true } },
      resolve: null,
      text: STEAL_TEXT,
    },
  ],
});
