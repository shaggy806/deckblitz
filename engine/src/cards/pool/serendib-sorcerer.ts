import { defineCard } from "../define.js";

// EDHREC rank 22164.

const TEXT =
  "{T}: Target creature other than this creature has base power and toughness 0/2 until end of turn.";

// Sorceress Queen's ability.
export default defineCard({
  name: "Serendib Sorcerer",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
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
