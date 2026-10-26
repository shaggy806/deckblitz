import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 26436.
//
// Rulings:
//   The ability triggers whenever you cast a spell that's both of its listed colors, whatever
//   other colors it is. Cast another one and it triggers again, setting base P/T again over
//   earlier setting effects; modifying effects and counters still apply (layer 7b vs 7c-d).
//
// Stature, Young Avenger's base-P/T `animate` until end of turn, on a spell filtered to
// both colours (`colors` must include all).

export default defineCard({
  name: "Battlegate Mimic",
  manaCost: "{1}{R/W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  text: "Whenever you cast a spell that's both red and white, this creature has base power and toughness 4/2 until end of turn and gains first strike until end of turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["R", "W"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 4,
            toughness: 2,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "Whenever you cast a spell that's both red and white, this creature has base power and toughness 4/2 until end of turn and gains first strike until end of turn.",
    },
  ],
});
