import { defineCard } from "../define.js";

// EDHREC rank 9707.
// One "destroy" over up to three targets: they're destroyed at once
// (`simultaneous`, Eliminate the Competition's shape). Armaggon may target
// itself, as the card allows.

export default defineCard({
  name: "Armaggon, Future Shark",
  manaCost: "{6}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shark", "Horror", "Mutant"],
  power: 9,
  toughness: 6,
  keywords: ["flash"],
  text: "Flash\nWhen Armaggon enters, destroy up to three target creatures.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: "creature", max: 3 }],
      effect: { kind: "for-each-target", from: 0, effect: { kind: "destroy", target: 0 }, simultaneous: true },
      resolve: null,
      text: "When Armaggon enters, destroy up to three target creatures.",
    },
  ],
});
