import { defineCard } from "../define.js";

// Future Sight (FUT). EDHREC rank 15509.
//
// Djinn of the Fountain's flicker with a delayed return (rule 610.3).
//
// Rulings:
//   [2007-05-01] If a creature enters after "at the beginning of the end step" abilities have
//     triggered during that turn, Saltskitter won't return to the battlefield until the end of the
//     following turn.

const TEXT =
  "Whenever another creature enters, exile this creature. Return this creature to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Saltskitter",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "any", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "flicker",
        target: "source",
        returnAt: "next-end-step",
        returnText: "Return Saltskitter to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
