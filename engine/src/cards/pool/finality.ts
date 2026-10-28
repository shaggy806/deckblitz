import { defineCard } from "../define.js";

const FACES = ["Find // Finality", "Find", "Finality"];

// The right half of Find // Finality (see find-finality.ts). The creature for
// the counters is chosen as it resolves, not targeted (its ruling).
export default defineCard({
  name: "Finality",
  manaCost: "{4}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "You may put two +1/+1 counters on a creature you control. Then all creatures get -4/-4 until end of turn.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 0,
        upTo: 1,
        prompt: "You may choose a creature you control to put two +1/+1 counters on",
        then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
      },
      { kind: "modify-pt-all", filter: { type: "creature" }, power: -4, toughness: -4, duration: "end-of-turn" },
    ],
  },
  faces: FACES,
  split: true,
});
