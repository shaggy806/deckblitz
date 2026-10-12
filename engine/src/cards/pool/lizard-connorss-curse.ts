import { defineCard } from "../define.js";

// EDHREC rank 10526.
//
// Rulings:
//   [2025-09-19] The effect from Lizard's triggered ability doesn't end at the end of the turn.

// Turn to Frog's `animate`, for good: "becomes a green Lizard creature" sets
// its card type (rule 205.1a — an artifact creature stops being an artifact,
// Sarkhan's `setTypes`), its creature types (`setSubtypes`), its colour and
// its base P/T, and it loses all abilities.
const FORMULA_TEXT =
  "Lizard Formula — When Lizard, Connors's Curse enters, up to one other target creature loses all abilities and becomes a green Lizard creature with base power and toughness 4/4.";

export default defineCard({
  name: "Lizard, Connors's Curse",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Lizard", "Villain"],
  power: 5,
  toughness: 5,
  keywords: ["trample"],
  text: `Trample\n${FORMULA_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        setTypes: ["creature"],
        addTypes: [],
        addSubtypes: [],
        setSubtypes: ["Lizard"],
        setColors: ["G"],
        loseAbilities: true,
        duration: "permanent",
      },
      resolve: null,
      text: FORMULA_TEXT,
    },
  ],
});
