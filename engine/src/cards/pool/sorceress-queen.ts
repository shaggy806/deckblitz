import { defineCard } from "../define.js";

// EDHREC rank 19260. "Has base power and toughness 0/2" is layer 7b (an
// `animate` adding no types, as Multiply by Zero); "other than this creature"
// is the `other` target wrapper.

const TEXT = "{T}: Target creature other than this creature has base power and toughness 0/2 until end of turn.";

export default defineCard({
  name: "Sorceress Queen",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard", "Sorcerer"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "animate",
        target: 0,
        power: 0,
        toughness: 2,
        addTypes: [],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
