import { defineCard } from "../define.js";

// EDHREC rank 7678.
//
// Counted once, as it resolves — the target itself too, if it's yours — and
// fixed for the turn after (the rulings).
const CREATURES_YOU_CONTROL = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Might of the Masses",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature gets +1/+1 until end of turn for each creature you control.",
  targets: ["creature"],
  effect: {
    kind: "modify-pt",
    target: 0,
    power: CREATURES_YOU_CONTROL,
    toughness: CREATURES_YOU_CONTROL,
    duration: "end-of-turn",
  },
});
