import { defineCard } from "../define.js";

// EDHREC rank 3234. "If you do" reads the counter actually removed: gone in
// response, nothing comes off and nothing is drawn.

const TEXT =
  "At the beginning of your upkeep, if this creature has one or more +1/+1 counters on it, you may remove a +1/+1 counter from it. If you do, draw a card.";

export default defineCard({
  name: "Ingenious Prodigy",
  manaCost: "{X}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 1,
  keywords: ["skulk"],
  text: `Skulk (This creature can't be blocked by creatures with greater power.)\nThis creature enters with X +1/+1 counters on it.\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a +1/+1 counter from this creature?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "remove-counter", target: "source", counter: "+1/+1", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "counters-removed" },
              then: { kind: "draw", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
