import { defineCard } from "../define.js";

export default defineCard({
  name: "Absorb Identity",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Return target creature to its owner's hand. You may have Shapeshifters you control become copies of that creature until end of turn.",
  targets: ["creature"],
  // One "may" for every Shapeshifter at once (the ruling: all or none), each
  // copying the creature as it last existed on the battlefield.
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      {
        kind: "may",
        prompt: "Have Shapeshifters you control become copies of that creature until end of turn?",
        effect: {
          kind: "become-copy",
          filter: { subtype: "Shapeshifter", controlledBy: "you" },
          of: 0,
          until: "end-of-turn",
        },
      },
    ],
  },
});
