import { defineCard } from "../define.js";

// Coldsnap (CSP). EDHREC rank 22732.
//
// Rulings:
//   [2006-07-15] Rimescale Dragon's last ability affects all permanents with ice counters on them,
//     whether or not it put the ice counters on them.

const TAP_TEXT = "{2}{S}: Tap target creature and put an ice counter on it. ({S} can be paid with one mana from a snow source.)";
const UNTAP_TEXT = "Creatures with ice counters on them don't untap during their controllers' untap steps.";

export default defineCard({
  name: "Rimescale Dragon",
  manaCost: "{5}{R}{R}",
  colors: ["R"],
  supertypes: ["snow"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${TAP_TEXT}\n${UNTAP_TEXT}`,
  activated: [
    {
      cost: { mana: "{2}{S}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "add-counter", target: 0, counter: "ice", amount: 1 },
        ],
      },
      resolve: null,
      text: "{2}{S}: Tap target creature and put an ice counter on it.",
    },
  ],
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", counters: { kind: "ice", compare: { op: "gte", n: 1 } } },
      },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
