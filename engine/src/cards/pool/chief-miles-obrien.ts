import { defineCard } from "../define.js";

// EDHREC rank 27078.

const SEEK_TEXT =
  "Seek out — Whenever you draw your second card each turn, double the number of each kind of counter on " +
  "target artifact or creature you control.";

export default defineCard({
  name: "Chief Miles O'Brien",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 4,
  text: SEEK_TEXT,
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["artifact", "creature"] } }],
      effect: { kind: "double-counters", target: 0 },
      resolve: null,
      text: SEEK_TEXT,
    },
  ],
});
