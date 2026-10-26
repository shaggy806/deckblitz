import { defineCard } from "../define.js";

const PLAINS_YOU_CONTROL = { subtype: "Plains", controlledBy: "you" } as const;

export default defineCard({
  name: "Plow Through Reito",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Sweep — Return any number of Plains you control to their owner's hand. Target creature gets +1/+1 until end of turn for each Plains returned this way.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: PLAINS_YOU_CONTROL,
        min: 0,
        upTo: { countOf: PLAINS_YOU_CONTROL },
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return any number of Plains you control to their owner's hand",
      },
      {
        kind: "modify-pt",
        target: 0,
        power: { thisWay: "returned-to-hand", filter: { subtype: "Plains" } },
        toughness: { thisWay: "returned-to-hand", filter: { subtype: "Plains" } },
        duration: "end-of-turn",
      },
    ],
  },
});
