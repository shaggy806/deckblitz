import { defineCard } from "../define.js";

// Saviors of Kamigawa (SOK). EDHREC rank 28109.
//
// Sweep: any number of Swamps chosen on resolution (not targets), then the
// discard counts the Swamps actually returned this way (Barrel Down
// Sokenzan's shape).
const TEXT =
  "Sweep — Return any number of Swamps you control to their owner's hand. Target player discards a card for each Swamp returned this way.";

export default defineCard({
  name: "Sink into Takenuma",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: TEXT,
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { subtype: "Swamp", controlledBy: "you" },
        min: 0,
        upTo: { countOf: { subtype: "Swamp", controlledBy: "you" } },
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return any number of Swamps you control to their owner's hand",
      },
      {
        kind: "discard",
        target: 0,
        amount: { thisWay: "returned-to-hand", filter: { subtype: "Swamp" } },
      },
    ],
  },
});
