import { defineCard } from "../define.js";

// EDHREC rank 29601.
//
// Rulings:
//   [2008-08-01] If you cast a spell that's the two appropriate colors for the second time in a
//     turn, the ability triggers again.
//   [2008-08-01] The ability triggers whenever you cast a spell that's both of its listed colors.
//     It doesn't matter whether that spell also happens to be any other colors.
//   [2008-08-01] The effect overwrites earlier P/T-setting effects only; it doesn't overwrite
//     modifications or later setting effects.
//
// "Has base power and toughness 4/5 until end of turn" is a layer-7b set at
// this effect's timestamp (Stature, Young Avenger's shape), keyword in tow.

const TEXT =
  "Whenever you cast a spell that's both black and green, this creature has base power and toughness 4/5 until end of turn and gains wither until end of turn. (It deals damage to creatures in the form of -1/-1 counters.)";

export default defineCard({
  name: "Woodlurker Mimic",
  manaCost: "{1}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { colors: ["B", "G"] } },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 5,
        addTypes: [],
        addSubtypes: [],
        keywords: ["wither"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
