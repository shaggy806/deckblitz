import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 31705.
//
// Rulings:
//   The ability triggers whenever you cast a spell that's both of its listed colors, whatever
//   other colors it is. Cast another one and it triggers again, setting base P/T again over
//   earlier setting effects; modifying effects and counters still apply (layer 7b vs 7c-d).
//
// Battlegate Mimic's shape, with Teleport's "can't be blocked this turn".

export default defineCard({
  name: "Riverfall Mimic",
  manaCost: "{1}{U/R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  text: "Whenever you cast a spell that's both blue and red, this creature has base power and toughness 3/3 until end of turn and can't be blocked this turn.",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["U", "R"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 3,
            toughness: 3,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"] },
        ],
      },
      resolve: null,
      text: "Whenever you cast a spell that's both blue and red, this creature has base power and toughness 3/3 until end of turn and can't be blocked this turn.",
    },
  ],
});
