import { defineCard } from "../define.js";

// EDHREC rank 29697.
//
// Exactly two targets (an `any-number` group of two), exiled and returned
// together by one delayed trigger, as Eerie Interlude's.

export default defineCard({
  name: "Temporal Tribulation",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  flashback: { cost: "{5}{U}" },
  text:
    "Exile two target permanents you control. Return those cards to the battlefield under their owner's control at " +
    "the beginning of the next end step.\nFlashback {5}{U} (You may cast this card from your graveyard for its " +
    "flashback cost. Then exile it.)",
  targets: [{ kind: "any-number", of: { kind: "permanent", whose: "you", filter: {} }, min: 2, max: 2 }],
  effect: {
    kind: "flicker",
    target: { from: 0 },
    returnAt: { step: "end" },
    returnText: "Return the exiled cards to the battlefield under their owner's control.",
  },
});
