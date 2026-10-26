import { defineCard } from "../define.js";

// EDHREC rank 30575. Stature, Young Avenger's base-P/T animate, on a cast
// filter whose `colors` must all be present ("both white and black").
//
// Rulings:
//   [2008-08-01] The ability triggers whenever you cast a spell that's both of its listed colors.
//     It doesn't matter whether that spell also happens to be any other colors.
//   [2008-08-01] Any other abilities the Mimic may have gained are not affected.

const TEXT =
  "Whenever you cast a spell that's both white and black, this creature has base power and toughness 4/4 until end of turn and gains flying until end of turn.";

export default defineCard({
  name: "Nightsky Mimic",
  manaCost: "{1}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["W", "B"] } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 4,
            toughness: 4,
            addTypes: [],
            addSubtypes: [],
            duration: "end-of-turn",
          },
          { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
