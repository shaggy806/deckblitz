import { defineCard } from "../define.js";

// EDHREC rank 6073. "Your team" is you outside a team game. A `would-add-counter`
// `plus` with no kind named adds one of each kind being put (the ruling: each
// instruction on its own), on permanents its controller controls — cost
// counters and a +N loyalty cost included, since the text says nothing of
// "effects" (rule 614.1, `replacement:counter-multiplier-on-costs`).
//
// Rulings:
//   If an effect includes multiple instructions to put one or more counters on a permanent, Pir's
//     effect applies to each of those instructions.
//   If a permanent your team controls would enter the battlefield with one or more counters of any
//     kind on it, it enters with that many plus one instead.
//   Pir's effect can't apply to itself as it's entering the battlefield or to any other permanent
//     entering the battlefield at the same time as it.

const PARTNER_TEXT =
  "Partner with Toothy, Imaginary Friend (When this creature enters, target player may put Toothy into their hand from their library, then shuffle.)";
const COUNTER_TEXT =
  "If one or more counters would be put on a permanent your team controls, that many plus one of each of those kinds of counters are put on that permanent instead.";

export default defineCard({
  name: "Pir, Imaginative Rascal",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  pairing: { kind: "partner-with", name: "Toothy, Imaginary Friend" },
  text: `${PARTNER_TEXT}\n${COUNTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a card named Toothy, Imaginary Friend?",
        effect: {
          kind: "search-library",
          filter: { name: "Toothy, Imaginary Friend" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: PARTNER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1 },
      text: COUNTER_TEXT,
    },
  ],
});
