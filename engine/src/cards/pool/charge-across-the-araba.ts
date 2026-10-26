import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 24954.
//
// Sweep: the Plains are chosen as it resolves, not targeted, and returned as one event
// (`choose-permanents` — Myr Battlesphere's shape); the bonus counts what this resolution
// returned to hand.

const PLAINS_YOU_CONTROL = { subtype: "Plains", controlledBy: "you" } as const;

export default defineCard({
  name: "Charge Across the Araba",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Sweep — Return any number of Plains you control to their owner's hand. Creatures you control get +1/+1 until end of turn for each Plains returned this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: PLAINS_YOU_CONTROL,
        upTo: { countOf: PLAINS_YOU_CONTROL },
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return any number of Plains you control to their owner's hand",
      },
      {
        kind: "modify-pt-all",
        filter: { type: "creature", controlledBy: "you" },
        power: { thisWay: "returned-to-hand" },
        toughness: { thisWay: "returned-to-hand" },
        duration: "end-of-turn",
      },
    ],
  },
});
