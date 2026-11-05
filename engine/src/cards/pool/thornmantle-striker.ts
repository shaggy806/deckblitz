import { defineCard } from "../define.js";
import type { EffectAmount } from "../../effects.js";

// EDHREC rank 22717.
//
// Rulings:
//   [2023-09-01] For the first mode, you choose which counters are removed as the ability
//     resolves. If the permanent has fewer counters on it than the number of Elves you control,
//     you'll remove all of them.
//   [2023-09-01] A planeswalker with no loyalty counters on it is put into its owner's graveyard.
//   [2023-09-01] For each mode, use the number of Elves you control as the
//     enters-the-battlefield ability resolves, including Thornmantle Striker itself if it's still
//     under your control.
//
// X is counted as the trigger resolves (`countOf`), this creature included
// while you still control it.
const ELVES: EffectAmount = { countOf: { subtype: "Elf", controlledBy: "you" } };
const TEXT =
  "When this creature enters, choose one —\n• Remove X counters from target permanent, where X is the number of Elves you control.\n• Target creature an opponent controls gets -X/-X until end of turn, where X is the number of Elves you control.";

export default defineCard({
  name: "Thornmantle Striker",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Elf", "Rogue"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "Remove X counters from target permanent, where X is the number of Elves you control.",
            targets: ["permanent"],
            effect: { kind: "remove-counters", target: 0, counter: "any", count: ELVES },
          },
          {
            text: "Target creature an opponent controls gets -X/-X until end of turn, where X is the number of Elves you control.",
            targets: ["creature-an-opponent-controls"],
            effect: {
              kind: "modify-pt",
              target: 0,
              power: { product: [ELVES, -1] },
              toughness: { product: [ELVES, -1] },
              duration: "end-of-turn",
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
