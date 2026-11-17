import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 12600. Odyssey.
//
// Chosen as it resolves, not targeted: a hexproof creature may be among them.
// The first choice is capped at what the second player controls — choosing
// more would leave the second choice short and the exchange incomplete, so
// nothing would change hands (rule 701.12a), the same as choosing none. The
// second is exactly as many as the first. Then each chosen creature one of
// the players controls goes to the other, at once with one timestamp.

const TEXT =
  "Choose any number of creatures target player controls. Choose the same number of creatures another target player controls. Those players exchange control of those creatures. (This effect lasts indefinitely.)";

const CREATURES_OF = (slot: number): EffectAmount => ({
  countOf: { type: "creature", controlledBy: "you" },
  forTarget: slot,
});

export default defineCard({
  name: "Cultural Exchange",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "creature" },
        controlledByPlayer: { target: 0 },
        upTo: { leastOf: [CREATURES_OF(0), CREATURES_OF(1)] },
        thenTogether: true,
        then: { kind: "sequence", effects: [] },
        prompt: "Choose any number of creatures the first target player controls",
      },
      {
        kind: "choose-permanents",
        filter: { type: "creature" },
        controlledByPlayer: { target: 1 },
        min: { thisWay: "chosen" },
        upTo: { thisWay: "chosen" },
        thenTogether: true,
        then: { kind: "sequence", effects: [] },
        prompt: "Choose the same number of creatures the second target player controls",
      },
      {
        kind: "exchange-control-all",
        filter: { thisWay: "chosen" },
        between: { target: 0 },
        with: { target: 1 },
        untilEndOfTurn: false,
      },
    ],
  },
});
