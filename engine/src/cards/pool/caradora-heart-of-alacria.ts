import { defineCard } from "../define.js";

// EDHREC rank 11614.
//
// Rulings:
//   [2025-02-07] If you somehow control multiple copies of Caradora, they would each increase the
//     number of +1/+1 counters put on a creature or Vehicle you control by one.
//   [2025-02-07] If two or more effects attempt to modify how many counters would be put on a
//     permanent you control, you choose the order to apply those effects, no matter who controls
//     the sources of those effects.
//   [2025-02-07] If a creature or Vehicle you control would enter the battlefield with a number of
//     +1/+1 counters on it, it enters with that many plus one instead.

export default defineCard({
  name: "Caradora, Heart of Alacria",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 2,
  text: "When Caradora enters, you may search your library for a Mount or Vehicle card, reveal it, put it into your hand, then shuffle.\nIf one or more +1/+1 counters would be put on a creature or Vehicle you control, that many plus one +1/+1 counters are put on it instead.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Mount or Vehicle card?",
        effect: {
          kind: "search-library",
          filter: { subtypes: ["Mount", "Vehicle"] },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When Caradora enters, you may search your library for a Mount or Vehicle card, reveal it, put it into your hand, then shuffle.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "+1/+1", filter: { anyOf: [{ type: "creature" }, { subtype: "Vehicle" }] } },
      text: "If one or more +1/+1 counters would be put on a creature or Vehicle you control, that many plus one +1/+1 counters are put on it instead.",
    },
  ],
});
