import { defineCard } from "../define.js";

// EDHREC rank 30344.
//
// A layer-7b base P/T set on herself until end of turn: counters and pumps
// still apply on top of the 4/4.

const CAST_TEXT =
  "Whenever you cast a noncreature spell, Stature has base power and toughness 4/4 until end of turn.";

export default defineCard({
  name: "Stature, Young Avenger",
  manaCost: "{1}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${CAST_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 4,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
