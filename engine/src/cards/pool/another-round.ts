import { defineCard } from "../define.js";

// EDHREC rank 3795. X + 1 passes; each pass chooses afresh, and what it exiles
// leaves and returns together (the rulings).
const MINE = { type: "creature", controlledBy: "you" } as const;

export default defineCard({
  name: "Another Round",
  manaCost: "{X}{X}{2}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile any number of creatures you control, then return them to the battlefield under their owner's control. Then repeat this process X more times.",
  targets: [],
  effect: {
    kind: "repeat",
    times: { sum: ["x", 1] },
    effect: {
      kind: "choose-permanents",
      filter: MINE,
      upTo: { countOf: MINE },
      min: 0,
      thenTogether: true,
      then: { kind: "flicker", target: { from: 0 } },
      prompt: "Exile any number of creatures you control, then return them to the battlefield",
    },
  },
});
