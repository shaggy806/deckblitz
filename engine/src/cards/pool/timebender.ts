import { defineCard } from "../define.js";

// The mode and its target are chosen as the trigger goes on the stack (its
// ruling) — an announced modal.
const TRIGGER = "When this creature is turned face up, choose one —";
const REMOVE = "• Remove two time counters from target permanent or suspended card.";
const PUT = "• Put two time counters on target permanent with a time counter on it or suspended card.";

export default defineCard({
  name: "Timebender",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 1,
  text: `Morph {U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${TRIGGER}\n${REMOVE}\n${PUT}`,
  morph: { keyword: "morph", cost: "{U}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            targets: [{ kind: "one-of", of: ["permanent", { kind: "card-in-exile", filter: { suspended: true } }] }],
            effect: { kind: "remove-counter", target: 0, counter: "time", amount: 2 },
            text: REMOVE,
          },
          {
            targets: [
              {
                kind: "one-of",
                of: [
                  { kind: "permanent", filter: { counters: { kind: "time", compare: { op: "gte", n: 1 } } } },
                  { kind: "card-in-exile", filter: { suspended: true } },
                ],
              },
            ],
            effect: { kind: "add-counter", target: 0, counter: "time", amount: 2 },
            text: PUT,
          },
        ],
      },
      resolve: null,
      text: `${TRIGGER}\n${REMOVE}\n${PUT}`,
    },
  ],
});
