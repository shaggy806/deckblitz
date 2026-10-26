import { defineCard } from "../define.js";

// EDHREC rank 29200. Future Sight.
//
// "It gains vanishing": vanishing with no number (rule 702.63a) is its two
// triggered abilities, granted for as long as it stays on the battlefield —
// still there if it's turned face down again (the ruling).

const FACE_UP_TEXT =
  "When this creature is turned face up, put two time counters on it and it gains vanishing. (At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)";

export default defineCard({
  name: "Maelstrom Djinn",
  manaCost: "{7}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Djinn"],
  power: 5,
  toughness: 6,
  keywords: ["flying"],
  morph: { keyword: "morph", cost: "{2}{U}" },
  text: `Flying\nMorph {2}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${FACE_UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "time", amount: 2 },
          {
            kind: "grant-triggered",
            target: "source",
            duration: "permanent",
            ability: {
              trigger: { on: "step-begins", step: "upkeep", who: "you" },
              condition: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1 } },
              targets: [],
              effect: { kind: "remove-counter", target: "source", counter: "time", amount: 1 },
              resolve: null,
              text: "Vanishing — At the beginning of your upkeep, if this permanent has a time counter on it, remove a time counter from it.",
            },
          },
          {
            kind: "grant-triggered",
            target: "source",
            duration: "permanent",
            ability: {
              trigger: { on: "counters-removed", who: "self", counter: "time", last: true },
              targets: [],
              effect: { kind: "sacrifice-source" },
              resolve: null,
              text: "Vanishing — When the last time counter is removed from this permanent, sacrifice it.",
            },
          },
        ],
      },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
