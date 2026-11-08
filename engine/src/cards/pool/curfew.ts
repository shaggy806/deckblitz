import { defineCard } from "../define.js";

export default defineCard({
  name: "Curfew",
  manaCost: "{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Each player returns a creature they control to its owner's hand.",
  effect: {
    kind: "for-each-player",
    who: "each-player",
    // Rule 101.4: chosen in APNAP order, returned together.
    choicesHeld: true,
    effect: {
      kind: "choose-permanents",
      chooser: "that-player",
      controlledByPlayer: "that-player",
      filter: { type: "creature" },
      min: 1,
      upTo: 1,
      then: { kind: "return-to-hand", target: 0 },
      prompt: "Return a creature you control to its owner's hand",
    },
  },
});
