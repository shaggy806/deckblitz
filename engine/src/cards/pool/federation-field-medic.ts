import { defineCard } from "../define.js";

const COUNTER_MODE = "Put a +1/+1 counter on target creature. It gains vigilance until end of turn.";
const DRAW_MODE = "Draw a card if you control a permanent with a counter on it.";

export default defineCard({
  name: "Federation Field Medic",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Doctor"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\nWhen this creature enters, choose one —\n• ${COUNTER_MODE}\n• ${DRAW_MODE}`,
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
            text: COUNTER_MODE,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
              ],
            },
          },
          {
            text: DRAW_MODE,
            // A counter of any kind, read as the mode resolves.
            effect: {
              kind: "conditional",
              condition: { kind: "controls", filter: { counters: { compare: { op: "gte", n: 1 } } }, atLeast: 1 },
              then: { kind: "draw", amount: 1 },
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
