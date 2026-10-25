import { defineCard } from "../define.js";

// EDHREC rank 12039. Khans of Tarkir.
//
// Ferocious is read once, as the pick's size is (the ruling: "before any
// creature cards are put onto the battlefield"), and the one or two chosen
// enter together.

export default defineCard({
  name: "See the Unwritten",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Reveal the top eight cards of your library. You may put a creature card from among them onto the battlefield. Put the rest into your graveyard.\nFerocious — If you control a creature with power 4 or greater, you may put two creature cards onto the battlefield instead of one.",
  targets: [],
  effect: {
    kind: "look-and-choose",
    zone: "library",
    count: 8,
    reveal: true,
    min: 0,
    max: {
      ifCondition: {
        kind: "controls",
        filter: { type: "creature", power: { op: "gte", n: 4 } },
        atLeast: 1,
      },
      then: 2,
      else: 1,
    },
    filter: { type: "creature" },
    destination: "battlefield",
    leftover: "graveyard",
  },
});
