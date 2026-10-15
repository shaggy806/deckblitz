import { defineCard } from "../define.js";

// EDHREC rank 18342.
//
// A prepare card (rule 722): its spell is Scrollboost (its own file, a
// `prepareSpellOnly` face). "One or more tokens you control enter" is
// Mister Fantastic's batched trigger — once per entry event, however many
// tokens arrive together.

export default defineCard({
  name: "Spiritcall Enthusiast",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 3,
  toughness: 3,
  text: "Whenever one or more tokens you control enter, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { token: true }, batched: true },
      targets: [],
      effect: { kind: "become-prepared", target: "source" },
      resolve: null,
      text: "Whenever one or more tokens you control enter, this creature becomes prepared.",
    },
  ],
  prepareSpell: "Scrollboost",
});
