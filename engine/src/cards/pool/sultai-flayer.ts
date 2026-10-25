import { defineCard } from "../define.js";

// EDHREC rank 24123. Khans of Tarkir.
//
// The dying creature's toughness is read as it last existed on the
// battlefield, so the Flayer's own death triggers it (the ruling).

const TRIGGER_TEXT = "Whenever a creature you control with toughness 4 or greater dies, you gain 4 life.";

export default defineCard({
  name: "Sultai Flayer",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Shaman"],
  power: 3,
  toughness: 4,
  text: TRIGGER_TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", toughness: { op: "gte", n: 4 } } },
      targets: [],
      effect: { kind: "gain-life", amount: 4 },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
