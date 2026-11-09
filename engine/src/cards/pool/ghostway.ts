import { defineCard } from "../define.js";

export default defineCard({
  name: "Ghostway",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text:
    "Exile each creature you control. Return those cards to the battlefield under their owner's control at the " +
    "beginning of the next end step.",
  targets: [],
  effect: {
    kind: "flicker",
    target: { all: { type: "creature", controlledBy: "you" } },
    returnAt: { step: "end" },
    returnText: "Return those cards to the battlefield under their owner's control.",
  },
});
