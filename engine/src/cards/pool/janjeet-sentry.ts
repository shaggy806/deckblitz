import { defineCard } from "../define.js";

// EDHREC rank 22173. "You may tap or untap" is chosen as it resolves: tap
// it, untap it, or neither.
const ENTER = "When this creature enters, you get {E}{E} (two energy counters).";
const TAP = "{T}, Pay {E}{E}: You may tap or untap target artifact or creature.";

export default defineCard({
  name: "Janjeet Sentry",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Soldier"],
  power: 2,
  toughness: 3,
  text: `${ENTER}\n${TAP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 2 },
      resolve: null,
      text: ENTER,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true, payEnergy: 2 },
      targets: ["artifact-or-creature"],
      effect: {
        kind: "modal",
        minModes: 0,
        maxModes: 1,
        modes: [
          { text: "Tap it", effect: { kind: "tap", target: 0 } },
          { text: "Untap it", effect: { kind: "untap", target: 0 } },
        ],
      },
      resolve: null,
      text: TAP,
    },
  ],
});
